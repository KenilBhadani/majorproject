
export default function Services() {
  // Data for the services to make the code cleaner
  const servicesList = [
    {
      id: 1,
      title: "Fine Dining",
      description: "Experience world-class culinary delights prepared by our expert chefs.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Luxury Spa",
      description: "Rejuvenate your body and mind with our therapeutic spa treatments.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Swimming Pool",
      description: "Relax in our temperature-controlled infinity pool with a city view.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "24/7 Room Service",
      description: "Whatever you need, whenever you need it. Just a phone call away.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 5,
      title: "Conference Halls",
      description: "State-of-the-art facilities for your business meetings and events.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 6,
      title: "Airport Pickup",
      description: "Seamless transfers to and from the airport in our luxury fleet.",
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      
      {/* Hero Section */}
      <div className="relative h-64 bg-slate-900 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl text-white font-serif font-bold mb-2">Our Services</h1>
        <p className="text-slate-300 max-w-lg">
          We go above and beyond to ensure your stay is comfortable, luxurious, and memorable.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl border-t-4 border-amber-600"
            >
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif">
                {service.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Extra Section: Dining Highlight */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="flex flex-col md:flex-row items-center bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Image Side - NOTE: Replace src with your local image path */}
            <div className="w-full md:w-1/2 h-64 md:h-96">
                <img 
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Fine Dining" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Text Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
                <h4 className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-2">Featured Service</h4>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Exquisite Dining Experience</h2>
                <p className="text-slate-600 mb-6">
                    Join us at "The Golden Plate," our award-winning in-house restaurant. 
                    Featuring a fusion of local flavors and international cuisine, it is the 
                    perfect spot for a romantic dinner or a business lunch.
                </p>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition">
                    View Menu
                </button>
            </div>
        </div>
      </div>

    </div>
  );
}