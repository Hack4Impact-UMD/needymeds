import { useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const faq_data = [
  {
    q: 'What are drug discount cards?',
    a: 'Discount drug cards offer discounts on prescription medications. They are not a form of insurance. Some are free while others may involve registration and/or a fee. They are offered by state governments, drug companies, non-profit and for-profit businesses. The NeedyMeds Drug Discount Card, which is free, also covers certain over-the-counter medicines and medical supplies that are written on a valid prescription. ',
  },
  {
    q: 'How do I pick a drug discount card?',
    a: 'Carefully evaluate any and all costs involved, such as handling or shipping fees. The fee may add up to more than discount. When using a fee card, it is still important to consider the cost of your medicine - you should always do comparative shopping. Speak with a representative of the plan about concerns and to check if your medicine is included. If you have several plans or cards, your local pharmacist will usually tell you the least expensive way to get your medicine.',
  },
  {
    q: 'Do some stores have pharmacy discount cards?',
    a: "Yes, many larger chains offer medicine discounts to their customers. Many offer some generic prescriptions for $4-$10. Visit NeedyMeds' $4 Generic Discount Drug Programs to find a pharmacy's generic drug program. These programs do not usually include all generics. Again, the pharmacist should be able to help you pick the least expensive way to buy your medicine.",
  },
  {
    q: 'How much will a card cost?',
    a: 'While some cards are free, others have annual fees that range from $12 to as high as $100. Some companies that advertise free medicine have a "processing fee" for each prescription.',
  },
  {
    q: 'How much will I save if I use one of these cards?',
    a: 'The discounts offered vary widely from 0-80% depending on the program, the drugstore and the prescription medicine being purchased. ',
  },
  {
    q: 'Will the discount card always give me the lowest price?',
    a: 'You may pay more for some brand name medicine, even with a discount, than you would pay for the generic version or you may find the medicine for a lower cost at a different pharmacy.',
  },
  {
    q: 'Will all my medicines be discounted?',
    a: 'Not necessarily. This is a consideration if you are paying a fee. Contact the program to see what medicine is available before making a payment.',
  },
  {
    q: 'What precautions should I take before choosing a drug discount card?',
    a: "Ask the following questions about the discount card: \n1.Is there a contact or customer service number that I can call in case of problems? \n2.What is the refund policy on fees? \n3.If I am being asked to send money, am I certain my medicine is available at a discount? \n4. Is the medicine I need available at no or low-cost through a patient assistance program? (Usually, this would be the better option. Click on Patient Assistance Programs.) \n5. Are my drugs provided through a mail-order or a walk-in pharmacy? If it's a walk-in, is there one close to me? If it is a mail-order pharmacy, are there additional handling and shipping costs?",
  },
];

export default function DDCFaqScreen({ onClose }: { onClose: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex == index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.x} onPress={onClose}>
        {' '}
        ㄨ{' '}
      </Text>
      <View style={styles.header}>
        <Text style={styles.title}> Drug Discount Card FAQs </Text>
      </View>

      {faq_data.map((item, i) => (
        <View key={i} style={styles.card}>
          <Pressable onPress={() => toggle(i)} style={styles.questionRow}>
            <Text style={styles.question}>{`${i + 1}. ${item.q}`}</Text>
            <Ionicons
              name={openIndex === i ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#000"
            />
          </Pressable>
          {openIndex === i && <Text style={styles.answer}>{item.a}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E7EDF5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '300',
    fontFamily: 'Nunito Sans',
    color: '#1C1C1C',
    textAlign: 'center',
  },
  card: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontFamily: 'Nunito Sans',
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    flex: 1,
  },
  answer: {
    marginTop: 8,
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  logo: {
    width: 84,
    height: 60,
  },
  x: {
    marginBottom: 10,
    fontSize: 22,
  },
});
