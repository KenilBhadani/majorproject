import hotelVideo from "../images/Luxury_hotel.mp4";

export default function EXPO() {
  return (
    <div className="bg-white text-slate-800">
      
      {/* Hero Section */}
      <div className="relative h-64 bg-slate-900 flex items-center justify-center">
        <h1 className="text-4xl text-white font-serif font-bold">
          Our Story
        </h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Introduction */}
        <h2 className="text-2xl font-bold mb-4 text-amber-600">
          A Legacy of Luxury
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
          Established in 2020, our hotel began with a simple yet powerful vision:
          to create a sanctuary where modern luxury meets timeless hospitality.
          Located in the heart of the city, we have welcomed thousands of guests
          seeking comfort, elegance, and unforgettable experiences.
        </p>

        <p className="mb-10 text-gray-600 leading-relaxed">
          Every detail of our hotel — from architectural design to personalized
          service — is crafted to ensure a peaceful and premium stay. We believe
          true luxury lies in thoughtful experiences and genuine care.
        </p>

        {/* Video Section */}
        <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden mb-12 shadow-lg">
          <video
            className="w-full h-full object-cover"
            src={hotelVideo}
            controls
            muted
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Mission Section */}
        <h3 className="text-xl font-bold mb-3 text-slate-800">
          Our Mission
        </h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Our mission is to deliver an exceptional hospitality experience that
          seamlessly blends comfort, elegance, and personalized service. We aim
          to create a welcoming environment where every guest feels valued,
          relaxed, and inspired.
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          Through attention to detail, refined design, and a commitment to
          excellence, we strive to exceed expectations at every stage of the
          guest journey — from effortless check-ins to tranquil stays and
          memorable dining experiences.
        </p>

        <p className="text-gray-600 leading-relaxed mb-10">
          We are dedicated to sustainability, community engagement, and
          continuous innovation, ensuring our hotel remains a trusted
          destination for travelers seeking quality, authenticity, and
          timeless luxury.
        </p>

        {/* Vision Section */}
        <h3 className="text-xl font-bold mb-3 text-slate-800">
          Our Vision
        </h3>
        <p className="text-gray-600 leading-relaxed">
          To become a leading symbol of modern hospitality, recognized for
          excellence, warmth, and unforgettable guest experiences across every
          stay.
        </p>

      </div>
    </div>
  );
}
