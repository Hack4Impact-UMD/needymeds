import { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

import { router } from 'expo-router';

import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';

const DATA = [
  {
    title: '1. Check for savings programs.',
    body: [
      'Look up:',
      'NeedyMeds Drug Discount Card (DDC) - Save up to 80% at participating pharmacies nationwide.',
      'Patient Assistance Programs (PAPs) - Offered by manufacturers to provide free or low-cost medications to eligible patients.',
      'Coupons & Rebates - May lower your out-of-pocket cost at the pharmacy.',
      'Direct-to-Consumer (DTC) Pricing - See which pharmacies offer transparent, discounted cash prices.',
    ],
  },
  {
    title: '2. Shop around — pharmacy prices can vary!',
    body: [
      'Even with the NeedyMeds Drug Discount Card, different pharmacies may offer different prices. Use our free tool to compare prices before you fill your prescription.',
    ],
  },
  {
    title: '3. Ask your doctor if a generic is available.',
    body: [
      'Generics have the same active ingredients and work the same way as brand-name drugs—often at a fraction of the cost.',
    ],
  },
  {
    title: '4. Ask about alternate medications.',
    body: [
      'Sometimes there’s a different drug that treats the same condition but costs less. Your doctor or pharmacist can help you compare options.',
    ],
  },
  {
    title: '5. Check if a 90-day supply costs less than a 30-day refill.',
    body: [
      'Many insurance plans and pharmacies offer lower per-dose prices when you fill a 90-day supply.',
    ],
  },
  {
    title: '6. Watch out for combination medications.',
    body: [
      'A single pill that combines two drugs may be more expensive than buying each medication separately. Ask your doctor or pharmacist if taking the components individually could save you money.',
    ],
  },
];

export default function Tips() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <Header />
      <BottomNavBar />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/education')}
            style={styles.backButton}
          >
            <Icon source="arrow-left" size={28} color="#41484D" />
          </TouchableOpacity>
          <Text style={styles.title}>Prescription{'\n'}Savings Tips</Text>
        </View>

        <View style={styles.introRow}>
          <Icon source="medical-cotton-swab" color="#41484D" size={30} />
          <Text style={styles.intro}>
            Saving money on prescriptions is possible! Try these steps to make sure you’re getting
            the best price for your medications:
          </Text>
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
