// Configuration parameters are set in a inline script
// pulled directly from the main html file.
// This helps terraform being able to configure the frontend
// by creating an s3 object in the bucket hosting the web
export const config = window.config
