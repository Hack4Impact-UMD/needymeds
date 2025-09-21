import { View, Text } from "react-native";
import fetchAdvice from "@/engineer-folders/bhavya-tanugula-kickoff-assignment/client";
import { useEffect, useState } from "react";
import FactCard from "@/engineer-folders/bhavya-tanugula-kickoff-assignment/FactCard";


interface Advice{
    id: number;
    advice: string;
}

function BhavyaPage() {
    const [adviceList, setAdviceList] = useState<Advice[]>([]);

    useEffect(() => {
        fetchAdvice().then((data) => {
            setAdviceList(data);
        });
    }, []);

    return (
        <View>
            <Text style={{ fontSize: 30, textAlign: 'center', marginTop: 20, fontWeight: 'bold' }}> Random Advice </Text>
            {adviceList.map((adv) => (
                <FactCard key={adv.id} id={adv.id} advice={adv.advice} />
            ))}
        </View>
    );
}

export default BhavyaPage;