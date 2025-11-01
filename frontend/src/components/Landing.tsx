import { useState } from "react";
import { Link } from "react-router-dom";

type Props = {};

const Landing = (props: Props) => {

  const [name, setName] = useState("");
 
  return (
    <div>
      <input
        type="text"
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      <Link to={`/room/?names=${name}`}>Join</Link>
    </div>
  );
};

export default Landing;
