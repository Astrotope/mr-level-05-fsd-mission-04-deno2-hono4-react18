FROM denoland/deno:2.1.1

WORKDIR /app

# Cache the dependencies
COPY deno.json deno.lock ./
RUN deno cache --lock=deno.lock deno.json

# Copy source code
COPY . .

# Cache the source code
RUN deno cache src/index.ts

EXPOSE 8000

CMD ["deno", "task", "start"]
