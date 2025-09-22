import React, { useEffect, useState } from "react";
import { View, ScrollView, Button } from "react-native";
import AdviceCard from "../engineer-folders/parsa-sedghi-kickoff-assignment/AdviceCard";
import { getRandomAdvice } from "../engineer-folders/parsa-sedghi-kickoff-assignment/client";

type Advice = Awaited<ReturnType<typeof getRandomAdvice>>;

function ParsaPage() {
  const [adviceList, setAdviceList] = useState<Advice[]>([]);

  useEffect(() => {
    (async () => {
      const items = await Promise.all([getRandomAdvice(), getRandomAdvice(), getRandomAdvice()]);
      setAdviceList(items);
    })();
  }, []);

  const addOne = async () => {
    const next = await getRandomAdvice();
    setAdviceList((prev) => [next, ...prev]);
  };

  return (
    <ScrollView>
      <View style={{ paddingVertical: 8 }}>
        <View style={{ alignSelf: "center", marginVertical: 8, width: 200 }}>
          <Button title="Get another" onPress={addOne} />
        </View>

        {adviceList.map((item, idx) => (
          <AdviceCard key={`${item.id}-${idx}`} id={item.id} advice={item.advice} />
        ))}
      </View>
    </ScrollView>
  );
}

export default ParsaPage;
