#!/usr/bin/env ruby
# frozen_string_literal: true

# Fetch prod chapter metadata for Yogaranya Video Workshops sessions and emit curriculum JSON + HTML fragments.
# Usage (from repo root):
#   ruby marketing/scripts/build-yogaranya-curriculum.rb
#   ruby marketing/scripts/build-yogaranya-curriculum.rb --copy-assets

require 'json'
require 'fileutils'
require 'optparse'
require 'dotenv'

ROOT = File.expand_path('../..', __dir__)
Dotenv.overload(File.join(ROOT, '.env.local'))
Dotenv.overload(File.join(Dir.home, '.cursor/.env.local'))

require 'aws-sdk-s3'

SESSIONS = [
  { number: 1, video_id: '168624', short_title: 'Understanding Scoliosis' },
  { number: 2, video_id: '169672', short_title: 'Diabetes Mellitus Overview' },
  { number: 3, video_id: '159349', short_title: 'Gut Health and Ayurvedic Healing' },
  { number: 4, video_id: '159025', short_title: 'Varicose Veins and Yoga Therapy' },
  { number: 5, video_id: '159018', short_title: 'Dietary Strategies for Chronic Conditions' },
  { number: 6, video_id: '159015', short_title: 'Menopause: Stages and Management' },
  { number: 7, video_id: '159005', short_title: 'Knee Joint Anatomy' },
  { number: 8, video_id: '159002', short_title: 'Fibromyalgia and Yoga' },
  { number: 9, video_id: '159001', short_title: 'Anatomical Terminology for Asanas' },
  { number: 10, video_id: '157565', short_title: 'Fatty Liver Disease' }
].freeze

SLIDE_SAMPLE_SESSIONS = [1, 5, 10].freeze
MAX_SLIDES_PER_SESSION = 4

PROD_ROOT = File.join(ROOT, 'tmp', 'yogaranya-prod')
OUT_JSON = File.join(ROOT, 'marketing', 'data', 'yogaranya-curriculum.json')
OUT_FRAGMENT = File.join(ROOT, 'marketing', 'data', 'yogaranya-curriculum-fragment.html')
OUT_PROGRAM_MAP = File.join(ROOT, 'marketing', 'data', 'yogaranya-program-map-fragment.html')
IMG_ROOT = File.join(ROOT, 'marketing', 'images', 'courses', 'yogaranya-video-workshops')
IMG_COURSE_SLUG = 'yogaranya-video-workshops'

REL_PATHS = [
  'videos/%<id>s/modularized-chapters-output/modularized_chapters.json',
  'videos/%<id>s/generate-chapters-output/chapters-meta-data.json',
  'videos/%<id>s/course-thumbnails-output/thumbnail.jpg',
  'videos/%<id>s/final-chapter-slides/final_slides_summary.json'
].freeze

def s3_client
  region = ENV['AWS_REGION'] || 'us-east-1'
  ca = ENV['AWS_CA_BUNDLE']
  ca = '/opt/homebrew/etc/ca-certificates/cert.pem' if ca.nil? && File.file?('/opt/homebrew/etc/ca-certificates/cert.pem')
  opts = { region: region, retry_limit: 3, ssl_verify_peer: true }
  opts[:ssl_ca_bundle] = ca if ca && File.file?(ca)
  Aws::S3::Client.new(opts)
end

def bucket
  ENV['S3_BUCKET'] || 'pn-class-videos'
end

def list_run_dates(client, video_id)
  base = "output/#{video_id}/"
  prefixes = []
  token = nil
  loop do
    resp = client.list_objects_v2(bucket: bucket, prefix: base, delimiter: '/', continuation_token: token)
    Array(resp.common_prefixes).each do |p|
      seg = p.prefix.sub(base, '').chomp('/')
      prefixes << seg unless seg.empty?
    end
    break unless resp.is_truncated

    token = resp.next_continuation_token
  end
  prefixes.select { |d| d.match?(/\A\d{4}-\d{2}-\d{2}T\d{6}Z\z/) }.sort
end

def download_key(client, key, dest_path)
  return dest_path if File.file?(dest_path) && File.size?(dest_path)

  FileUtils.mkdir_p(File.dirname(dest_path))
  File.open(dest_path, 'wb') do |f|
    client.get_object(bucket: bucket, key: key) { |chunk| f.write(chunk) }
  end
  dest_path
end

def parse_timecode_to_seconds(tc)
  return 0 if tc.nil? || tc.to_s.strip.empty?

  main, frac = tc.to_s.split(',', 2)
  parts = main.split(':').map(&:to_i)
  return 0 if parts.empty?

  h, m, s = case parts.length
            when 3 then parts
            when 2 then [0, parts[0], parts[1]]
            else [0, 0, parts[0]]
            end
  h * 3600 + m * 60 + s + (frac.to_f / 1000.0)
end

def parse_duration_seconds(chapters_meta)
  return 0 unless chapters_meta.is_a?(Array) && !chapters_meta.empty?

  last_end = chapters_meta.map { |ch| ch['EndTime'] }.compact.last
  span = parse_timecode_to_seconds(last_end)
  return span if span.positive?

  chapters_meta.sum do |ch|
    d = ch['DurationSeconds'] || ch['duration'] || ch['video_duration'] || ch['length_seconds']
    d = d.to_f if d
    next 0 unless d && d.positive?

    d
  end
end

def load_modularized(path)
  return nil unless File.file?(path) && File.size?(path).to_i.positive?

  data = JSON.parse(File.read(path, encoding: 'UTF-8'))
  modules = Array(data['modules']).map do |mod|
    chapters = Array(mod['chapters']).map do |ch|
      {
        'number' => ch['chapter_number'].to_s,
        'title' => ch['chapter_title'].to_s.strip
      }
    end
    {
      'title' => mod['module_title'].to_s.strip,
      'chapters' => chapters
    }
  end
  {
    'videoTitle' => data['video_title'].to_s.strip,
    'modules' => modules,
    'chapterCount' => modules.sum { |m| m['chapters'].size }
  }
end

def slide_paths_from_summary(summary_path)
  return [] unless File.file?(summary_path) && File.size?(summary_path).to_i.positive?

  summary = JSON.parse(File.read(summary_path, encoding: 'UTF-8'))
  paths = []
  if summary.is_a?(Array)
    summary.each do |chapter|
      Array(chapter['slides']).each do |s|
        next unless s.is_a?(Hash)

        p = s['slide_path'] || s['path'] || s['file']
        paths << p if p && !p.empty?
      end
    end
    return paths
  end
  slides = summary['slides'] || summary['accepted_slides'] || []
  slides = slides.values if slides.is_a?(Hash)
  Array(slides).filter_map do |s|
    next unless s.is_a?(Hash)

    s['slide_path'] || s['path'] || s['file'] || s['image_path']
  end
end

def list_stage3_slides(client, prefix)
  keys = []
  token = nil
  loop do
    resp = client.list_objects_v2(bucket: bucket, prefix: prefix, continuation_token: token)
    Array(resp.contents).each do |obj|
      keys << obj.key if obj.key.match?(/stage3_final_slides\/.*\.(jpg|jpeg|png)\z/i)
    end
    break unless resp.is_truncated

    token = resp.next_continuation_token
  end
  keys.sort
end

def format_duration_label(total_seconds)
  return '~90 min' if total_seconds <= 0

  minutes = (total_seconds / 60.0).round
  if minutes >= 120
    hrs = minutes / 60
    rem = minutes % 60
    rem.positive? ? "~#{hrs} hr #{rem} min" : "~#{hrs} hr"
  else
    "~#{minutes} min"
  end
end

def format_hours_label(total_seconds)
  return '~15+ hr' if total_seconds <= 0

  hours = (total_seconds / 3600.0).round(1)
  if hours >= 15
    '~15+ hr'
  elsif hours >= 10
    '~10+ hr'
  elsif hours >= 1
    h = hours.floor
    m = ((hours - h) * 60).round
    m.positive? ? "~#{h} hr #{m} min" : "~#{h} hr"
  else
    format_duration_label(total_seconds)
  end
end

def html_escape(s)
  s.to_s.gsub('&', '&amp;').gsub('<', '&lt;').gsub('>', '&gt;').gsub('"', '&quot;')
end

def build_program_map_fragment(sessions)
  sessions.map do |sess|
    meta_parts = ["#{sess['chapterCount']} chapters", sess['durationLabel']]
    meta_parts << 'slides' if sess['hasSlides']
    meta = meta_parts.join(' · ')
    <<~HTML.strip
      <a href="#session-#{sess['number']}" class="course-landing-program-card" data-program-session="#{sess['number']}">
          <span class="course-landing-program-card__num">Session #{sess['number']}</span>
          <span class="course-landing-program-card__title">#{html_escape(sess['shortTitle'])}</span>
          <span class="course-landing-program-card__meta">#{html_escape(meta)}</span>
      </a>
    HTML
  end.join("\n")
end

def build_curriculum_fragment(sessions)
  lines = []
  sessions.each do |sess|
    open_attr = sess['number'] == 1 ? ' data-accordion-open' : ''
    lines << %(                <div class="course-landing-accordion-item course-landing-session-item" id="session-#{sess['number']}" data-accordion-item data-session-number="#{sess['number']}"#{open_attr}>)
    lines << %(                    <button type="button" id="session-toggle-#{sess['number']}" data-accordion-toggle class="w-full flex items-start gap-3 p-4 sm:p-5 text-left cursor-pointer hover:bg-slate-50 transition-colors">)
    lines << %(                        <span class="course-landing-module-num">#{sess['number']}</span>)
    lines << %(                        <span class="flex-1 min-w-0">)
    lines << %(                            <span class="block course-landing-module-title">#{html_escape(sess['shortTitle'])}</span>)
    meta = "#{sess['chapterCount']} chapters · #{html_escape(sess['durationLabel'])}"
    meta += ' · slides' if sess['hasSlides']
    lines << %(                            <span class="block course-landing-module-meta">#{meta}</span>)
    lines << %(                        </span>)
    lines << %(                        <span class="material-symbols-rounded text-slate-400 mt-1" data-accordion-chevron>expand_more</span>)
    lines << %(                    </button>)
    lines << %(                    <div data-accordion-content class="hidden border-t border-slate-100">)
    lines << %(                        <div class="course-landing-session-chapters p-4 sm:p-5 pt-3">)

    sess['modules'].each do |mod|
      if sess['modules'].size > 1 && mod['title'] && !mod['title'].empty?
        lines << %(                            <p class="course-landing-session-module-title">#{html_escape(mod['title'])}</p>)
      end
      lines << %(                            <ul class="course-landing-chapter-list space-y-2 mb-4">)
      mod['chapters'].each do |ch|
        lines << %(                                <li class="course-landing-chapter-item"><span class="course-landing-chapter-num">#{html_escape(ch['number'])}</span><span class="course-landing-chapter-title">#{html_escape(ch['title'])}</span></li>)
      end
      lines << %(                            </ul>)
    end

    lines << %(                        </div>)
    lines << %(                    </div>)
    lines << %(                </div>)
  end
  lines.join("\n")
end

copy_assets = false
OptionParser.new do |o|
  o.on('--copy-assets') { copy_assets = true }
end.parse!

client = s3_client
built_sessions = []
total_chapters = 0
total_seconds = 0
slides_with = 0

def pick_run_with_modularized(client, video_id, dates)
  dates.reverse_each do |run|
    key = "output/#{video_id}/#{run}/#{format(REL_PATHS[0], id: video_id)}"
    begin
      client.head_object(bucket: bucket, key: key)
      return run
    rescue Aws::S3::Errors::NotFound, Aws::S3::Errors::NoSuchKey
      next
    end
  end
  dates.last
end

SESSIONS.each do |seed|
  vid = seed[:video_id]
  dates = list_run_dates(client, vid)
  if dates.empty?
    warn "No timestamped runs for #{vid}"
    next
  end
  run = pick_run_with_modularized(client, vid, dates)
  run_prefix = "output/#{vid}/#{run}/"
  dest_run = File.join(PROD_ROOT, vid, run)
  FileUtils.mkdir_p(dest_run)
  puts "Using run #{run} for #{vid}"

  REL_PATHS.each do |rel|
    rel_path = format(rel, id: vid)
    key = "#{run_prefix}#{rel_path}"
    dest = File.join(dest_run, rel_path)
    begin
      download_key(client, key, dest)
      puts "OK #{vid}: #{rel_path}"
    rescue Aws::S3::Errors::NoSuchKey
      warn "MISSING #{vid}: #{key}"
    end
  end

  mod_path = File.join(dest_run, format(REL_PATHS[0], id: vid))
  meta_path = File.join(dest_run, format(REL_PATHS[1], id: vid))
  summary_path = File.join(dest_run, format(REL_PATHS[3], id: vid))

  mod_data = load_modularized(mod_path)
  chapters_meta = File.file?(meta_path) ? JSON.parse(File.read(meta_path, encoding: 'UTF-8')) : []
  chapters_meta = chapters_meta['chapters'] if chapters_meta.is_a?(Hash) && chapters_meta['chapters']
  sec = parse_duration_seconds(chapters_meta)

  slide_keys = slide_paths_from_summary(summary_path)
  stage3_prefix = "#{run_prefix}videos/#{vid}/final-chapter-slides/stage3_final_slides/"
  stage3_keys = list_stage3_slides(client, stage3_prefix)
  has_slides = slide_keys.any? || stage3_keys.any?
  slides_with += 1 if has_slides

  sample_slide_paths = []
  if SLIDE_SAMPLE_SESSIONS.include?(seed[:number])
    keys_to_fetch = stage3_keys.first(MAX_SLIDES_PER_SESSION)
    if keys_to_fetch.empty? && slide_keys.any?
      keys_to_fetch = slide_keys.first(MAX_SLIDES_PER_SESSION).map do |p|
        rel = p.start_with?('final-chapter-slides/') ? p : "final-chapter-slides/#{p}"
        "#{run_prefix}videos/#{vid}/#{rel}"
      end
    end

    keys_to_fetch.each_with_index do |s3_key, idx|
      fname = format('slide-%02d.jpg', idx + 1)
      dest = File.join(PROD_ROOT, vid, 'sample-slides', fname)
      download_key(client, s3_key, dest)
      rel = "../images/courses/#{IMG_COURSE_SLUG}/slides/session-%02d/#{fname}" % seed[:number]
      sample_slide_paths << rel
      if copy_assets
        asset_dest = File.join(IMG_ROOT, 'slides', format('session-%02d', seed[:number]), fname)
        FileUtils.mkdir_p(File.dirname(asset_dest))
        FileUtils.cp(dest, asset_dest, preserve: true)
      end
    end
  end

  chapter_count = mod_data ? mod_data['chapterCount'] : 0
  total_chapters += chapter_count
  total_seconds += sec

  thumb_rel = nil
  if copy_assets
    thumb_src = File.join(dest_run, format(REL_PATHS[2], id: vid))
    if File.file?(thumb_src)
      if seed[:number] == 1
        hero_dest = File.join(IMG_ROOT, 'thumbnail.jpg')
        FileUtils.mkdir_p(IMG_ROOT)
        FileUtils.cp(thumb_src, hero_dest, preserve: true)
      end
      sess_dest = File.join(IMG_ROOT, format('session-%02d-thumb.jpg', seed[:number]))
      FileUtils.cp(thumb_src, sess_dest, preserve: true)
      thumb_rel = "../images/courses/#{IMG_COURSE_SLUG}/#{File.basename(sess_dest)}"
    end
  end

  built_sessions << {
    'number' => seed[:number],
    'videoId' => vid,
    'shortTitle' => seed[:short_title],
    'videoTitle' => mod_data ? mod_data['videoTitle'] : seed[:short_title],
    'durationLabel' => format_duration_label(sec),
    'durationSeconds' => sec,
    'hasSlides' => has_slides,
    'modules' => mod_data ? mod_data['modules'] : [],
    'chapterCount' => chapter_count,
    'thumbnailPath' => thumb_rel,
    'sampleSlides' => sample_slide_paths
  }
end

manifest = {
  'courseTitle' => 'Yogaranya Video Workshops',
  'courseSubtitle' => 'Health-focused workshops from Yogaranya teachers',
  'instructor' => 'Ramya Siddamsetty',
  'organization' => 'Yogaranya',
  'sessions' => built_sessions,
  'totals' => {
    'sessions' => built_sessions.size,
    'chapters' => total_chapters,
    'hoursLabel' => format_hours_label(total_seconds),
    'totalSeconds' => total_seconds,
    'sessionsWithSlides' => slides_with
  }
}

FileUtils.mkdir_p(File.dirname(OUT_JSON))
File.write(OUT_JSON, JSON.pretty_generate(manifest))
File.write(OUT_FRAGMENT, build_curriculum_fragment(built_sessions))
File.write(OUT_PROGRAM_MAP, build_program_map_fragment(built_sessions))

puts "\nWrote #{OUT_JSON}"
puts "Wrote #{OUT_FRAGMENT}"
puts "Wrote #{OUT_PROGRAM_MAP}"
puts "Totals: #{built_sessions.size} sessions, #{total_chapters} chapters, #{format_hours_label(total_seconds)}, #{slides_with}/#{built_sessions.size} with slides"
