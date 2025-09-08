import React from 'react';
import styled from 'styled-components';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card__border" />
        <div className="card_title__container">
          <div className="pt-2 pb-2" style={{'display': 'flex', 'justifyContent': 'center', 'marginBottom': '1rem'}}>
            <div  style={{'width': '3rem', 'height': '3rem', 'backgroundColor': '#4300FF', 'borderRadius': '0.5rem', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
              <Icon style={{'width': '1.5rem', 'height': '1.5rem', 'color': 'white'}} />
            </div>
          </div>
          <span className="card_title ">{title}</span>
          <p className="card_paragraph">{description}</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    --white: hsl(0, 0%, 100%);
    --black: hsl(240, 15%, 9%);
    --paragraph: hsl(0, 0%, 83%);
    --line: hsl(240, 9%, 17%);
    --primary: #0032f8ff;

    position: relative;

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;

    padding: 2rem 1rem;
    
    width: 19rem;
    height: 100%;
    background-color: hsla(240, 15%, 9%, 1);
    background-image: radial-gradient(
        at 88% 40%,
        hsla(240, 15%, 9%, 1) 0px,
        transparent 85%
      ),
      radial-gradient(at 49% 30%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
      radial-gradient(at 14% 26%, hsla(240, 15%, 9%, 1) 0px, transparent 85%),
      radial-gradient(at 0% 64%, #0065F8 0px, transparent 85%),
      radial-gradient(at 41% 94%, #0065F8 0px, transparent 85%),
      radial-gradient(at 100% 99%, #0065F8 0px, transparent 85%);

    border-radius: 1rem;
    box-shadow: 0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset;
  }

  .card .card__border {
    overflow: hidden;
    pointer-events: none;

    position: absolute;
    z-index: -10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: calc(100% + 2px);
    height: calc(100% + 2px);
    background-image: linear-gradient(
      0deg,
      hsl(0, 0%, 100%) -50%,
      hsl(0, 0%, 40%) 100%
    );

    border-radius: 1rem;
  }

  .card .card__border::before {
    content: "";
    pointer-events: none;

    position: fixed;
    z-index: 200;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%), rotate(0deg);
    transform-origin: left;

    width: 200%;
    height: 10rem;
    background-image: linear-gradient(
      0deg,
      hsla(0, 0%, 100%, 0) 0%,
      #0065F8 40%,
      #0065F8 60%,
      hsla(0, 0%, 40%, 0) 100%
    );

    animation: rotate 8s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }

  .card .card_title__container {
    text-align: center;
  }

  .card .card_title__container .card_title {
    font-size: 1.5rem;
    color: var(--white);
    padding-bottom:10%;
    font-weight: 600;
  }

  .card .card_title__container .card_paragraph {
    margin-top: 0.5rem;
    width: 100%;
    padding-bottom:10%;
    padding-top:10%;
    padding-left:5%;
    padding-right:5%;
    font-size: 1rem;
    color: var(--paragraph);
  }
`;

export default FeatureCard;