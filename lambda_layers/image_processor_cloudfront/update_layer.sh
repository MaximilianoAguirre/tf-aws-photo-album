docker run --rm -v $(pwd):/app -w /app node:18 npm install

mkdir nodejs
mv node_modules nodejs

zip -r image_processor_cloudfront.zip .

rm -rf nodejs
