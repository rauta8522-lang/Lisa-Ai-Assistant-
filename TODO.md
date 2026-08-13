# TODO - Fix YouTube autoplay / media playback

## Step 1: Identify/adjust double navigation (YouTube watch tab auto-open)
- ✅ Done: `src/App.tsx` me YouTube `videoId` resolve hote hi watch tab auto-open remove kiya.

## Step 2: Make YouTube iframe play deterministic
- ✅ Done: `src/components/MediaWidget.tsx` me `postMessage playVideo` ke liye retry loop add kiya.

## Step 3: Preserve fallback behavior safely
- Kept existing 6s watch fallback in `MediaWidget.tsx` (cancel-aware).

## Step 4: Run & verify
- Run: `npm run dev`
- Test utterances: "play <song> on youtube" / "chalao <song>" / "bajao <song>"
- Confirm: inline player (MediaWidget) me playback start hota hai, “sirf search karke deta hai” wala behavior nahi.

## Step 5: If still not autoplaying
- Browser/PWA autoplay policy ke wajah se inline autoplay mute ho sakta hai.
- Next fix: user gesture (Unmute/Play button) ko required make karna (UI/flow change).

