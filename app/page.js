import Header from "../components/Header";

export default function Page() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold">Главная</h1>
        <p className="mt-4 text-zinc-600">Здесь будем собирать блоки по порядку.</p>
      </main>
    </>
  );
}
