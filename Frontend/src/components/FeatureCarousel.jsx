import React from 'react';
import './FeatureCarousel.css';

const FeatureCarousel = ({ features }) => {
  return (
    <div className="carousel-container">
      <div className="carousel">
        {features.map((feature, index) => (
          <div className="carousel-item" key={index}>
            <div className="card">
              <div className="card__border" />
              <div className="card_title__container">
                <div className="pt-2 pb-2" style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '1rem'}}>
                  <div  style={{'width': '3rem', 'height': '3rem', 'backgroundColor': '#4300FF', 'borderRadius': '0.5rem', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
                    <feature.icon style={{'width': '1.5rem', 'height': '1.5rem', 'color': 'white'}} />
                  </div>
                </div>
                <span className="card_title ">{feature.title}</span>
                <p className="card_paragraph">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureCarousel;