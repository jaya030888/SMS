import Gallery_card from "../../components/Gallery_Card"


const Gallery = () => {
  return (
    <section className="section gallery-section">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Campus life</p>
          <h1>Gallery</h1>
          <p>A quick look at practical training, labs, and hands-on learning spaces.</p>
        </div>
        <div className="card-grid gallery-grid">
          <Gallery_card image="/file.svg" alter="Technical workshop" text="Technical Training Workshop" />
          <Gallery_card image="/file.svg" alter="Computer lab" text="Computer Lab Sessions" />
          <Gallery_card image="/file.svg" alter="Practical training" text="Practical Training" />
          <Gallery_card image="/file.svg" alter="Modern equipment" text="Modern Equipment" />
          <Gallery_card image="/file.svg" alter="Campus infrastructure" text="Campus Infrastructure" />
          <Gallery_card image="/file.svg" alter="Hands-on learning" text="Hands-on Learning" />
        </div>
      </div>
    </section>
  )
}

export default Gallery
