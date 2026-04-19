import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const Survey = () => {
  const { t } = useTranslation();
  const showSurvey = useState(false);
  const params = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* header area */}
        <DefaultHeader />
        <View style={styles.pageBody}>
          <View style={styles.pageHeader}>
            <View style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={25}
                color={Colors.default.neutraldk}
                onPress={() => {
                  router.push({
                    pathname: '/DDC',
                    params: {
                      drugName: params.drugName,
                      quantity: params.quantity,
                      form: params.form,
                      adjudicator: params.adjudicator,
                      pharmacyName: params.pharmacyName,
                      pharmacyAddress: params.pharmacyAddress,
                      pharmacyPhone: params.pharmacyPhone,
                      ndc: params.ndc,
                      labelName: params.labelName,
                      price: params.price,
                      latitude: params.latitude,
                      longitude: params.longitude,
                      distance: params.distance,
                    },
                  });
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

export default Survey;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  scrollContent: {
    padding: 20,
  },
  pageBody: {
    gap: 5,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    paddingHorizontal: 10,
    textAlign: 'left',
    fontWeight: '400',
    color: '#1F2328',
    fontFamily: 'Nunito Sans',
  },
  actionButtonsWrap: {
    gap: 12,
    marginBottom: 25,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.default.brandBlue,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  actionButtonCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236488',
    borderRadius: 28,
  },
  actionButtonFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236488',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    paddingLeft: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Open Sans',
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 12,
    color: Colors.default.neutraldk,
    textDecorationLine: 'underline',
  },
});
