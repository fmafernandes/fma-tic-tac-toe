import React from 'react';
import './square.css';

function Square(props) {
  return (
    <button
      className={`${props.class} ${props.color}`}
      onClick={props.onClick}
    >
      <span>{props.value}</span>
    </button>
  );
}

export default Square;