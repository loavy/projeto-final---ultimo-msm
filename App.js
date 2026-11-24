import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
const colors = {
  ink: "#17243b",
  muted: "#67748a",
  blue: "#3159d9",
  pale: "#f5f7fb",
  line: "#e3e8f0",
  white: "#fff",
  green: "#16794b",
  red: "#b42318",
};

async function api(path, options = {}, token) {
  if (!API_URL)
    throw new Error(
      "Configure EXPO_PUBLIC_API_URL no arquivo .env do app mobile.",
    );
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.mensagem || "Não foi possível falar com a API.");
  return data;
}

function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.buttonSecondary,
        danger && styles.buttonDanger,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[styles.buttonText, secondary && styles.buttonSecondaryText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9aa4b2"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [year, setYear] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    enunciado: "",
    explicacao: "",
    subtopico_id: "1",
    tipo: "base",
    conteudo: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync("session");
        if (saved) {
          const session = JSON.parse(saved);
          setUser(session.usuario);
          setToken(session.token);
        }
      } catch {
        await SecureStore.deleteItemAsync("session");
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const loadQuestions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      setQuestions(
        await api(`/api/questoes${params.size ? `?${params}` : ""}`),
      );
    } catch (e) {
      setError(e.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (user) loadQuestions();
  }, [user, loadQuestions]);

  async function login() {
    try {
      setLoading(true);
      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), senha: password }),
      });
      const session = { usuario: result.usuario, token: result.token };
      await SecureStore.setItemAsync("session", JSON.stringify(session));
      setUser(result.usuario);
      setToken(result.token);
      setPassword("");
    } catch (e) {
      Alert.alert("Não foi possível entrar", e.message);
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    await SecureStore.deleteItemAsync("session");
    setUser(null);
    setToken(null);
    setQuestions([]);
  }
  function filterQuestions() {
    loadQuestions({ q: search.trim(), nivel: level, ano: year.trim() });
  }
  function openForm(question = null) {
    setEditing(question);
    setFormOpen(true);
    setForm({
      enunciado: question?.enunciado || "",
      explicacao: question?.explicacao || "",
      subtopico_id: String(question?.subtopico_id || question?.topicoid || "1"),
      tipo: question?.tipo || "base",
      conteudo: question?.conteudo || "",
    });
  }
  async function saveQuestion() {
    try {
      const body = JSON.stringify({
        ...form,
        subtopico_id: Number(form.subtopico_id),
      });
      await api(
        editing ? `/api/questoes/${editing.id}` : "/api/questoes",
        { method: editing ? "PUT" : "POST", body },
        token,
      );
      setEditing(null);
      setFormOpen(false);
      await loadQuestions({ q: search.trim(), nivel: level, ano: year.trim() });
      Alert.alert("Pronto", "Questão salva.");
    } catch (e) {
      Alert.alert("Erro", e.message);
    }
  }
  function deleteQuestion(question) {
    Alert.alert("Excluir questão", `Deseja excluir a questão ${question.id}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api(
              `/api/questoes/${question.id}`,
              { method: "DELETE" },
              token,
            );
            await loadQuestions({
              q: search.trim(),
              nivel: level,
              ano: year.trim(),
            });
          } catch (e) {
            Alert.alert("Erro", e.message);
          }
        },
      },
    ]);
  }

  if (restoring)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.blue} />
      </SafeAreaView>
    );
  if (!user)
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.loginWrap}
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandIcon}>π</Text>
          </View>
          <Text style={styles.eyebrow}>SESI • SENAI</Text>
          <Text style={styles.title}>Estude matemática{"\n"}no seu ritmo.</Text>
          <Text style={styles.subtitle}>
            Entre para consultar questões, respostas e explicações.
          </Text>
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
          />
          <Field
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
          />
          <Button
            title={loading ? "Entrando…" : "Entrar"}
            onPress={login}
            disabled={loading || !email || !password}
          />
          <Text style={styles.apiHint}>
            {API_URL
              ? "Conectado à API configurada"
              : "Configure EXPO_PUBLIC_API_URL para conectar à API."}
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topbar}>
        <View>
          <Text style={styles.eyebrow}>SESI • SENAI</Text>
          <Text style={styles.topTitle}>Matemática</Text>
        </View>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Sair</Text>
        </Pressable>
      </View>
      <FlatList
        data={questions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.greeting}>
              <Text style={styles.greetingTitle}>
                Olá, {user.email.split("@")[0]} 👋
              </Text>
              <Text style={styles.muted}>
                Um passo de cada vez. Vamos estudar?
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Encontrar questões</Text>
            <Field
              label="Enunciado"
              value={search}
              onChangeText={setSearch}
              placeholder="Ex.: pirâmide, área, volume…"
            />
            <View style={styles.filterLabel}>
              <Text style={styles.label}>Nível</Text>
            </View>
            <View style={styles.chips}>
              {[
                ["", "Todos"],
                ["base", "Base"],
                ["intermediario", "Intermediário"],
                ["avancado", "Avançado"],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setLevel(value)}
                  style={[styles.chip, level === value && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      level === value && styles.chipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Field
              label="Ano (opcional)"
              value={year}
              onChangeText={setYear}
              placeholder="Ex.: 2024"
              keyboardType="number-pad"
            />
            <Button title="Buscar questões" onPress={filterQuestions} />
            {user.perfil === "professor" && (
              <View style={styles.professorBox}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.professorTitle}>Área do professor</Text>
                    <Text style={styles.muted}>
                      Gerencie o banco de questões
                    </Text>
                  </View>
                  <Button title="＋ Nova" onPress={() => openForm()} />
                </View>
              </View>
            )}
            {formOpen && (
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>
                  {editing ? `Editar questão ${editing.id}` : "Nova questão"}
                </Text>
                <Field
                  label="Enunciado"
                  value={form.enunciado}
                  onChangeText={(v) => setForm({ ...form, enunciado: v })}
                  placeholder="Escreva o enunciado"
                />
                <Field
                  label="Explicação"
                  value={form.explicacao}
                  onChangeText={(v) => setForm({ ...form, explicacao: v })}
                  placeholder="Como resolver?"
                />
                <Field
                  label="Subtópico ID"
                  value={form.subtopico_id}
                  onChangeText={(v) => setForm({ ...form, subtopico_id: v })}
                  keyboardType="number-pad"
                />
                <View style={styles.row}>
                  <Button title="Salvar" onPress={saveQuestion} />
                  <Button
                    title="Cancelar"
                    secondary
                    onPress={() => {
                      setFormOpen(false);
                      setEditing(null);
                    }}
                  />
                </View>
              </View>
            )}
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionTitle}>Questões</Text>
              <Text style={styles.count}>{questions.length} encontradas</Text>
            </View>
            {loading && (
              <ActivityIndicator
                style={{ marginVertical: 22 }}
                color={colors.blue}
              />
            )}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                  title="Tentar novamente"
                  secondary
                  onPress={() => loadQuestions()}
                />
              </View>
            )}
            {!loading && !error && questions.length === 0 && (
              <Text style={styles.empty}>
                Nenhuma questão encontrada. Tente ajustar os filtros.
              </Text>
            )}
          </>
        }
        renderItem={({ item }) => {
          const isOpen = !!expanded[item.id];
          const answer = item.alternativas?.find(
            (alternative) => alternative.correta,
          );
          return (
            <View style={styles.card}>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>
                  {item.vestibular || "Questão"}
                  {item.ano ? ` · ${item.ano}` : ""}
                </Text>
                {item.nivel && (
                  <Text style={styles.levelTag}>{item.nivel}</Text>
                )}
              </View>
              <Text style={styles.questionId}>QUESTÃO {item.id}</Text>
              <Text style={styles.questionText}>
                {item.enunciado || "Enunciado não informado."}
              </Text>
              {item.alternativas?.map((alternative) => (
                <Text
                  key={`${item.id}-${alternative.letra}`}
                  style={styles.alternative}
                >
                  <Text style={styles.alternativeLetter}>
                    {alternative.letra}){" "}
                  </Text>
                  {alternative.texto}
                </Text>
              ))}
              <Pressable
                onPress={() => setExpanded({ ...expanded, [item.id]: !isOpen })}
                style={styles.answerButton}
              >
                <Text style={styles.answerButtonText}>
                  {isOpen
                    ? "Ocultar resolução  −"
                    : "Ver resposta e explicação  ＋"}
                </Text>
              </Pressable>
              {isOpen && (
                <View style={styles.answerBox}>
                  <Text style={styles.label}>RESPOSTA</Text>
                  <Text style={styles.answerText}>
                    {answer
                      ? `${answer.letra}) ${answer.texto}`
                      : "Resposta não cadastrada."}
                  </Text>
                  <Text style={[styles.label, { marginTop: 14 }]}>
                    EXPLICAÇÃO
                  </Text>
                  <Text style={styles.answerText}>
                    {item.explicacao || "Explicação não cadastrada."}
                  </Text>
                </View>
              )}
              {user.perfil === "professor" && (
                <View style={styles.row}>
                  <Button
                    title="Editar"
                    secondary
                    onPress={() => openForm(item)}
                  />
                  <Button
                    title="Excluir"
                    danger
                    onPress={() => deleteQuestion(item)}
                  />
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.pale,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loginWrap: { flex: 1, justifyContent: "center", padding: 26 },
  brandMark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#e8edff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  brandIcon: { color: colors.blue, fontSize: 30, fontWeight: "700" },
  eyebrow: {
    color: colors.blue,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    fontWeight: "800",
    marginTop: 9,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 28,
  },
  field: { marginBottom: 15 },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 13,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    color: colors.ink,
    fontSize: 15,
  },
  button: {
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 17,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonSecondaryText: { color: colors.ink },
  buttonDanger: { backgroundColor: "#fff0ee" },
  apiHint: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
    marginTop: 16,
  },
  topbar: {
    paddingHorizontal: 21,
    paddingVertical: 13,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "800",
    marginTop: 2,
  },
  logout: { color: colors.blue, fontWeight: "700", padding: 8 },
  listContent: { padding: 18, paddingBottom: 44 },
  greeting: {
    backgroundColor: "#eaf0ff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 23,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 5,
  },
  muted: { color: colors.muted, fontSize: 13 },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 13,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 15 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: "#e8edff", borderColor: colors.blue },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: colors.blue },
  filterLabel: { marginTop: 1 },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
  },
  count: { color: colors.muted, fontSize: 12 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: { color: colors.muted, fontSize: 12 },
  levelTag: {
    color: colors.blue,
    backgroundColor: "#eff2ff",
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  questionId: {
    color: colors.blue,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
    marginTop: 13,
  },
  questionText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
    marginTop: 6,
  },
  alternative: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  alternativeLetter: { color: colors.ink, fontWeight: "800" },
  answerButton: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: 15,
    paddingTop: 13,
  },
  answerButtonText: { color: colors.blue, fontSize: 13, fontWeight: "700" },
  answerBox: {
    marginTop: 12,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#f3f6ff",
  },
  answerText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 4 },
  empty: {
    color: colors.muted,
    backgroundColor: colors.white,
    padding: 18,
    borderRadius: 13,
    lineHeight: 21,
  },
  errorBox: { backgroundColor: "#fff0ee", padding: 15, borderRadius: 13 },
  errorText: { color: colors.red, marginBottom: 8 },
  professorBox: {
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    marginTop: 8,
  },
  professorTitle: { color: colors.ink, fontWeight: "800", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  formCard: {
    padding: 15,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 15,
    marginTop: 12,
  },
});
