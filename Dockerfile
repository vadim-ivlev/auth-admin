FROM caddy:2.4.6-alpine

# COPY Caddyfile /etc/caddy/Caddyfile
COPY public /srv
# COPY public /var/www/html 
# WORKDIR /srv
CMD caddy file-server