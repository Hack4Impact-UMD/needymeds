import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';

export default function Tips() {
  const { t } = useTranslation();

  const DATA = [
    {
      title: `1. ${t('AccordionHeader1')}`,
      body: [
        t('AccordionAnswer1A'),
        t('AccordionAnswer1B'),
        t('AccordionAnswer1C'),
        t('AccordionAnswer1D'),
        t('AccordionAnswer1E'),
      ],
    },
    {
      title: `2. ${t('AccordionHeader2')}`,
      body: [t('AccordionAnswer2')],
    },
    {
      title: `3. ${t('AccordionHeader3')}`,
      body: [t('AccordionAnswer3')],
    },
    {
      title: `4. ${t('AccordionHeader4')}`,
      body: [t('AccordionAnswer4')],
    },
    {
      title: `5. ${t('AccordionHeader5')}`,
      body: [t('AccordionAnswer5')],
    },
    {
      title: `6. ${t('AccordionHeader6')}`,
      body: [t('AccordionAnswer6')],
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <Header />
      <BottomNavBar />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/educational-resources')}
            style={styles.backButton}
          >
            <Icon source="arrow-left" size={28} color="#41484D" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('Header3')}</Text>
        </View>

        <View style={styles.introRow}>
          <Icon source="medical-cotton-swab" color="#41484D" size={30} />
          <Text style={styles.intro}>{t('Text14')}</Text>
        </View>

        {DATA.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <View key={idx} style={styles.card}>
              <Pressable onPress={() => setOpen(isOpen ? null : idx)} style={styles.row}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Icon source={isOpen ? 'menu-up' : 'menu-down'} size={20} color="#181C20" />
              </Pressable>

              {isOpen && (
                <View style={styles.body}>
                  {item.body.map((line, i) => {
                    const isBullet = idx === 0 && i > 0; // bulleted only if it's in the first section AND after the "Look up:" line

                    // \u2022 is the bullet unicode
                    return (
                      <View key={i} style={styles.bulletRow}>
                        {isBullet && <Text style={styles.bullet}>{'\u2022'}</Text>}
                        <Text style={[styles.line, isBullet && { flex: 1 }]}>{line}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: 80,
    height: 40,
    marginLeft: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingHorizontal: 20,
    paddingBottom: 68,
    fontFamily: 'Nunito Sans',
    backgroundColor: '#F6FAFE',
  },
  header: {
    backgroundColor: '#F6FAFE',
    elevation: 0,
  },
  content: {
    paddingVertical: 8,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: 300,
    color: '#181C20',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  introRow: {
    marginVertical: 22,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  intro: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#181C20',
  },
  card: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 400,
    color: '#181C20',
  },
  body: {
    marginTop: 8,
    gap: 6,
  },
  line: {
    fontSize: 15,
    color: '#181C20',
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontSize: 20,
    lineHeight: 16,
    color: '#181C20',
    marginTop: 2,
  },
});
