export const metadata = {
  title: "About Us - Pak-Exporters",
  description: "Pakistan's First Export Marketplace - Connecting exporters with global buyers since 2019",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Pak-Exporters</h1>
          <p className="text-xl text-muted-foreground">Pakistan&apos;s First Export Marketplace</p>
          <p className="text-sm text-muted-foreground mt-2">Since 2019</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
            <p className="text-muted-foreground text-lg">
              Pak-Exporters is Pakistan&apos;s first and premier B2B export marketplace, 
              connecting local exporters with global buyers since 2019. We facilitate 
              international trade by providing a trusted platform for businesses to discover, 
              connect, and trade export-quality products worldwide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              To empower Pakistani businesses by providing them with the tools and platform
              needed to reach global markets, while ensuring quality, trust, and transparency
              in every transaction. We work together to promote Pakistan&apos;s export industry
              and connect premium suppliers with international buyers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Super Fast Fulfillment</li>
                <li>1st Fully Live Tracking</li>
                <li>45+ Unique Products</li>
                <li>Export Quality Products</li>
                <li>Secure System</li>
              </ul>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Verified suppliers and exporters</li>
                <li>Wide range of product categories</li>
                <li>Global reach with local expertise</li>
                <li>Online Support 24/7</li>
                <li>Premium supplier network</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Global Connectivity</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with B2B merchants worldwide and expand your business reach
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Advertising Platform</h3>
                <p className="text-sm text-muted-foreground">
                  Advertise with us to target the globe and reach international markets
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Online support 24/7 with caring professionalism for all your needs
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Categories</h2>
            <p className="text-muted-foreground mb-4">
              We offer a comprehensive range of export-quality products across multiple categories:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-muted rounded">Agriculture</div>
              <div className="p-3 bg-muted rounded">Textiles & Garments</div>
              <div className="p-3 bg-muted rounded">Chemicals</div>
              <div className="p-3 bg-muted rounded">Surgical Instruments</div>
              <div className="p-3 bg-muted rounded">Leather & Sports Gears</div>
              <div className="p-3 bg-muted rounded">Apparel & Clothing</div>
              <div className="p-3 bg-muted rounded">Health & Hygiene Products</div>
              <div className="p-3 bg-muted rounded">Machinery & Equipment</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

