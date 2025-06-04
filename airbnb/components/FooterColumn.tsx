"use client"

import { motion } from "framer-motion";

type Props = {
    index: number;
    data: Array<string>;
  };

function FooterColumn({ index, data }: Props) {
    const columnItems = data.map((item, itemIndex) => 
        itemIndex === 0 
        ? <h5 key={itemIndex} className="font-bold">{item}</h5>
        : <p key={itemIndex}>{item}</p>);

    return (
      <div className="space-y-4 text-xs text-gray-800">
        <motion.div
          initial={{
            x: index % 2 === 0 ? -200 : 200,
            opacity: 0,
          }}
          transition={{ duration: 1 }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          {columnItems}
        </motion.div>
      </div>
    );
}

export default FooterColumn;