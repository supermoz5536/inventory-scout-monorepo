import React, { useEffect, useState } from "react";

const StockDetail = () => {
  const [targetAsinData, setTargetAsinData] = useState<AsinData>();

  useEffect(() => {
    window.myAPI.receiveAsinData((asinData: AsinData) => {
      console.log("receiveAsinData");
      setTargetAsinData(asinData);
    });
  }, [targetAsinData]);

  return (
    <>
      <div>StockDetail</div>
      <p>{targetAsinData?.asin}</p>
    </>
  );
};

export default StockDetail;
