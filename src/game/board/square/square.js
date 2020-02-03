import React from 'react';
import './square.css';

/**
 * Individual square for the board
 * @param {*} props - Properties from parent component
 */
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