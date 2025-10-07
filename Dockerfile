FROM node:22 AS builder
ARG APPLICATION_YAML

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .

RUN mkdir resources -p
RUN echo ${APPLICATION_YAML} | base64 -d > ./resources/application.yaml

RUN pnpm run build

FROM node:latest
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/resources /app/resources

RUN pnpm install --frozen-lockfile --production

CMD ["pnpm", "run", "start:prod"]
EXPOSE 8080
