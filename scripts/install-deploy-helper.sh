#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID}" -ne 0 ]; then
  echo "sudo ./scripts/install-deploy-helper.sh として実行してください。"
  exit 1
fi

if [ -z "${SUDO_USER:-}" ]; then
  echo "SUDO_USER が取れません。通常ユーザーから sudo で実行してください。"
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
TARGET_USER="${SUDO_USER}"
PUBLISHER="/usr/local/bin/physics-lab-publish"
SUDOERS_FILE="/etc/sudoers.d/physics-lab-publish"

cat > "${PUBLISHER}" <<EOF
#!/usr/bin/env bash
set -euo pipefail

SRC_ROOT="${REPO_ROOT}"
DEST_ROOT="/srv/www/physics-lab"
FILES=(
  acceleration.html
  compass.html
  gyroscope.html
  index.html
  location.html
  magnetometer.html
  qr.html
  sound.html
  stopwatch.html
)

mkdir -p "\${DEST_ROOT}"
for file in "\${FILES[@]}"; do
  install -m 0644 "\${SRC_ROOT}/\${file}" "\${DEST_ROOT}/\${file}"
done
EOF

chmod 755 "${PUBLISHER}"
chown root:root "${PUBLISHER}"

cat > "${SUDOERS_FILE}" <<EOF
${TARGET_USER} ALL=(root) NOPASSWD: ${PUBLISHER}
EOF

chmod 440 "${SUDOERS_FILE}"
chown root:root "${SUDOERS_FILE}"
visudo -cf "${SUDOERS_FILE}" >/dev/null

echo "初期設定が完了しました。"
echo "以後は ./scripts/deploy-physics-lab で反映できます。"
