export default function VideoBackground() {
  return (
    <div className="video-background">
      <video autoPlay muted loop playsInline>
        <source src="/videos/warehouse-bg.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />
    </div>
  );
}
