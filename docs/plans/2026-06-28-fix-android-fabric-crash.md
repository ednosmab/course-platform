# Plano: Correcção do Crash Android Fabric (String → Boolean)

**Data:** 2026-06-28
**Autor do plano:** plan agent
**Executor previsto:** build agent
**Reviewer:** review agent
**Branch:** feat/offline-first

## 🎯 Objectivo

Corrigir o crash `java.lang.String cannot be cast to java.lang.Boolean` que ocorre durante a inicialização do Fabric no Android, causado por versões incompatíveis de módulos nativos Expo e dependências transitiveas.

## 🔍 Diagnóstico

O crash ocorre em `preallocateView → createViewInstance → updateProperties → setProperty` durante o Fabric interop layer. A causa raiz é:

1. **7 pacotes Expo com versões incompatíveis** com SDK 54 (major version mismatches)
2. **4 módulos nativos duplicados** (até 3 versões simultâneas)
3. **Peer dependency em falta** (`react-native-svg`)
4. **`react-native-reanimated@4.3.1`** puxado transitiveamente por `@tamagui/config@2.0.0-rc.42`

## 📋 Steps

### Step 1: Corrigir versões Expo via `npx expo install`
- **Ficheiro:** `apps/student/package.json`
- **Acção:** Correr `npx expo install` para forçar versões compatíveis com SDK 54
- **Verificação:** `npx expo install --check` deve mostrar 0 major mismatches
- [ ] (preenchido pelo build)

### Step 2: Instalar peer dependency em falta
- **Ficheiro:** `apps/student/package.json`
- **Acção:** Correr `npx expo install react-native-svg`
- **Verificação:** `pnpm ls react-native-svg` mostra a versão instalada
- [ ] (preenchido pelo build)

### Step 3: Limpar e reinstalar dependências
- **Ficheiro:** `pnpm-lock.yaml`
- **Acção:** `rm -rf node_modules && pnpm install`
- **Verificação:** `pnpm install` termina sem erros
- [ ] (preenchido pelo build)

### Step 4: Reconstruir prebuild nativo
- **Ficheiro:** `apps/student/android/` (regenerado)
- **Acção:** `npx expo prebuild --clean` para regenerar os binários nativos
- **Verificação:** Directório `android/` regenerado sem erros
- [ ] (preenchido pelo build)

### Step 5: Validar com expo-doctor
- **Acção:** `cd apps/student && npx expo-doctor`
- **Verificação:** 0 checks failed, 18/18 passed
- [ ] (preenchido pelo build)

### Step 6: Build e teste no Android
- **Acção:** `npx expo start --android` e escanear QR code pelo Expo Go
- **Verificação:** App abre sem crash, navegação funciona
- [ ] (preenchido pelo build)

## 🛡️ Salvaguardas S1..S6

- **S1:** NÃO fazer `git commit` sem autorização do utilizador após teste no celular
- **S2:** NÃO alterar `metro.config.js` sem necessidade (mantê-lo como está)
- **S3:** NÃO instalar dependências novas além das indicadas pelo `expo install`
- **S4:** Se `npx expo prebuild --clean` falhar, reportar o erro e parar
- **S5:** Se o crash persistir após fix, testar `newArchEnabled: false` como fallback
- **S6:** Manter `pnpm run lint` verde (0 erros) após cada step

## 📊 Métricas-alvo

| Métrica | Target | Tolerância |
|---|---|---|
| `npx expo install --check` major mismatches | 0 | 0 |
| Módulos nativos duplicados | 0 | 0 |
| `pnpm run lint` erros | 0 | 0 |
| `npx expo-doctor` checks passed | 18/18 | ≥16/18 |
| App abre no Android sem crash | Sim | N/A |

## ⚠️ Pontos de pausa G-01

1. **Após Step 2** — PARAR e mostrar ao utilizador as versões que vão ser instaladas antes de correr `pnpm install`
2. **Após Step 5** — PARAR e mostrar resultado do `expo-doctor` antes de avançar para teste
3. **Após Step 6** — PARAR e aguardar confirmação do utilizador de que o app funciona no celular

## 📝 Versões esperadas (Expo SDK 54)

| Pacote | Actual | Correcta |
|---|---|---|
| `expo-constants` | 17.0.8 | ~18.0.13 |
| `expo-file-system` | 56.0.8 | ~19.0.23 |
| `expo-font` | 56.0.5 | ~14.0.12 |
| `expo-av` | 15.0.2 | ~16.0.8 |
| `expo-sqlite` | 56.0.5 | ~16.0.10 |
| `expo-linking` | 7.0.5 | ~8.0.12 |
| `@react-native-community/netinfo` | 12.0.1 | 11.4.1 |
| `react-native-screens` | 4.25.2 | ~4.16.0 |
| `react-native-safe-area-context` | 5.7.0 | ~5.6.0 |
| `@react-native-async-storage/async-storage` | 2.1.2 | 2.2.0 |
| `react-native-svg` | (em falta) | peer dep |

## 🔄 Fallback

Se o crash persistir após este plano:
1. Desactivar `newArchEnabled: false` em `apps/student/app.json` linha 10
2. Desactivar `edgeToEdgeEnabled: false` em `apps/student/app.json` linha 26
3. Correr `npx expo prebuild --clean` e testar novamente
