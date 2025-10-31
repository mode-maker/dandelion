// app/albums/page.jsx
import AlbumStrips from '../../components/AlbumStrips';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Альбомы — Dandelion',
  description: 'Фотоальбомы мастер-классов и мероприятий Dandelion.',
};

export default function Page(){
  return <AlbumStrips />;
}
