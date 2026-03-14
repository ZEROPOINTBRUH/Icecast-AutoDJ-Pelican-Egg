FROM oven/bun:latest

WORKDIR /app

# Copy project files (only what's needed for the public server)
COPY scripts ./scripts
COPY public ./public
COPY configs ./configs

EXPOSE 3000

ENV PUBLIC_PORT=3000 AUTODJ_HOST=autodj AUTODJ_PORT=8000

CMD ["bun", "./scripts/public.ts"]
