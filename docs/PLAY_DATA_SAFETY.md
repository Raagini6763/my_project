# CitznY Google Play data-safety checklist

Use this as a review aid when completing Play Console. Verify every answer against the final production build and current Google policy.

## Data handled

- User content: story text, photos, videos and audio recordings.
- Optional personal information: author email entered or attached to a submission.
- Approximate location: a user-written village, district or state description; the app does not request device GPS.
- App activity: campaign join/share interactions associated with a Firebase anonymous identifier.
- Authentication information: administrator email and Firebase authentication credentials.

## Processing and sharing

- Firebase Authentication authenticates administrators and assigns anonymous identifiers to public contributors.
- Cloud Firestore stores story metadata, moderation status, campaigns and campaign interactions.
- Supabase Storage stores user-selected media in the public `sample` bucket after submission.
- Cloudflare Workers proxies translation and story-refinement requests.
- Google Gemini processes interface text for translation and submitted story text for grammar refinement.
- Approved stories and media are intentionally made public; pending and rejected submissions are restricted to administrators.

## Play Console declarations

- Declare collection and service-provider sharing accurately for user content, optional email, approximate location and app interactions.
- Mark data as encrypted in transit where applicable.
- Do not claim that all data is optional: story content is required to submit a story, while each media type is conditional on the chosen format.
- Supply the hosted privacy-policy URL, developer contact, retention/deletion process, content rating and target-audience answers.
- Re-check Firebase, Supabase, Cloudflare and Gemini retention terms before submission.

## Required operational actions

- Host the privacy policy at a stable public HTTPS URL and enter that URL in Play Console.
- Provide a monitored developer contact for story correction/deletion requests.
- Document the internal deletion procedure for Firestore documents and Storage objects.
