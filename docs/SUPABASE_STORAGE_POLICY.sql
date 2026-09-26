-- Run this once in Supabase Dashboard > SQL Editor.
-- The `sample` bucket must be marked Public so approved story media can be displayed.
-- Configure the bucket itself with a 50 MB file limit and these MIME families:
-- image/*, video/*, audio/*

drop policy if exists "Allow story media uploads" on storage.objects;

create policy "Allow story media uploads"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'sample'
  and (storage.foldername(name))[1] = 'stories'
  and lower(storage.extension(name)) in (
    'jpg', 'jpeg', 'png', 'webp', 'heic',
    'mp4', 'mov',
    'mp3', 'm4a', 'webm', 'wav'
  )
);
