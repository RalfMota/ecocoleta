# EcoColeta Solidária é, hoje, um site estático (HTML/CSS/JS, sem backend
# próprio) — este Dockerfile empacota esse site com um servidor Nginx mínimo,
# para que o mesmo artefato (imagem) seja promovido entre homologação e
# produção, conforme o plano de CI/CD.
FROM nginx:1.27-alpine

COPY index.html /usr/share/nginx/html/index.html
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost/ || exit 1
