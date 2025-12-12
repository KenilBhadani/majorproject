import '../Componentcss/index.css'
function Horosection() {
    return(
        <div>
            <header className="header">
              <div className='nav-bar'>
                <div className='navbarlogo'>RoyalPark</div>
                <ul className='header-ul'>
                    <li className="headerlabel">Home</li>
                    <li className="headerlabel">About</li>
                    <li className="headerlabel">Services</li>
                    <li className="headerlabel">Explore</li>
                    <li className="headerlabel">Contact</li>
                </ul>
                <button className='headerbtn'>Book Now</button>
                </div> 
                <div className='herosection'>
                    <p id='firstp'>Simple - Unique - Frindly</p>
                    <p id='secondp'>Make Yourself At Home In Our <span className='Herop'>Hotel.</span></p>
                </div>
            </header>
        </div>
    );
}
export default Horosection;