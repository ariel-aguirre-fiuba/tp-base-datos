set -eux

cd webapp
VITE_API_URL=bancoapi/api npm run build
ssh oceano 'rm -r /data/bancofiuba'
rsync -rv dist/ oceano:/data/bancofiuba/