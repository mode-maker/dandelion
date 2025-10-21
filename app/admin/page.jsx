'use client';

export default function AdminHome() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#070b14',
      color: '#E7E8E0',
      padding: '40px'
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Админ · Галерея</h1>
      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Страница админки подключена. Дальше добавим загрузку, список фото, массовые действия и т.д.
      </p>
    </div>
  );
}
