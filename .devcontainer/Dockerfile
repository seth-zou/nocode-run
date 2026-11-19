FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm

# Install build tools and OS dependencies required by native Node modules
# (e.g. sqlite3 needs python3 + make + g++ to compile from source when no
# prebuilt binary is available for the platform).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# [Optional] Install git-lfs if the repo uses large files
RUN su node -c "npm install -g npm@latest" 2>/dev/null || true
