import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DDCFaqScreen({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();

  const faq_data = [
    {
      q: t('Text6'),
      a: t('Accordion1'),
    },
    {
      q: t('Text7'),
      a: t('Accordion2'),
    },
    {
      q: t('Text8'),
      a: t('Accordion3'),
    },
    {
      q: t('CardCostQuestion'),
      a: t('Accordion4'),
    },
    {
      q: t('Text9'),
      a: t('Accordion5'),
    },
    {
      q: t('Text10'),
      a: t('Accordion6'),
    },
    {
      q: t('Text11'),
      a: t('Accordion7'),
    },
    {
      q: t('Text12'),
      a: t('Accordion8'),
    },
  ];

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
        <Text style={styles.title}>{t('Heading')}</Text>
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
    backgroundColor: Colors.default.neutrallt,
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
