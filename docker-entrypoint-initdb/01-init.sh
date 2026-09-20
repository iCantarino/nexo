#!/bin/bash
# =====================================================================
# Inicialização do Banco de Dados Nexo
# Executado automaticamente pelo MySQL ao iniciar o container
# (docker-entrypoint-initdb.d)
# =====================================================================

set -e

echo "=== Nexo: Inicializando banco de dados ==="

# ─── 1. Cria o database (se não existir) ──────────────────────────
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS nexo_db
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci;
EOSQL
echo "[OK] Database nexo_db criado/verificado."

# ─── 2. Executa o schema.sql (tabelas + seeds de domínio) ─────────
if [ -f /docker-entrypoint-initdb.d/schema.sql ]; then
    echo "Executando schema.sql (tabelas e seeds)..."
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" nexo_db < /docker-entrypoint-initdb.d/schema.sql
    echo "[OK] Schema executado com sucesso."
else
    echo "[AVISO] schema.sql não encontrado. Pulando."
fi

# ─── 3. Tenta importar backup.sql (dados de exemplo) ──────────────
if [ -f /docker-entrypoint-initdb.d/backup.sql ]; then
    echo "Importando backup.sql (dados de exemplo)..."
    # O backup.sql pode estar em UTF-16 (mysqldump); tentamos com utf16
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" \
        --default-character-set=utf16 \
        nexo_db < /docker-entrypoint-initdb.d/backup.sql 2>/dev/null && \
        echo "[OK] Dados de exemplo importados." || \
        echo "[AVISO] backup.sql não pôde ser importado (formato UTF-16). Os dados de exemplo podem ser importados manualmente depois."
fi

echo "=== Nexo: Banco inicializado com sucesso! ==="