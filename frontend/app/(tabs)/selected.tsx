import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Searchbar, TextInput, Provider as PaperProvider } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import PharmacyRow from '../components/PharmacyRow'; // adjust alias if needed
import BottomNavBar from '../components/BottomNavBar';

const SelectedScreen = () => {
  const langOptions = [
    { label: 'EN', value: 'EN' },
    { label: 'SP', value: 'SP' },
  ];
  const sortOptions = [
    { label: 'By price', value: 'price' },
    { label: 'By distance', value: 'distance' },
  ];
  const formOptions = [
    { label: 'tube', value: 'tube' },
    { label: 'form', value: 'form' },
  ];

  const [search, setSearch] = useState('');
  const [buttonBKG, setButtonBKG] = useState('white');
  const [buttonText, setButtonText] = useState('#41484D');
  const [lang, setLang] = useState('EN');
  const [form, setForm] = useState('');
  const [sort, setSort] = useState('');

  const handleButton = () => {
    if (buttonBKG === 'white') {
      // when button option is selected
      setButtonBKG('#B6EBFF');
      setButtonText('#004E60');
    } else {
      setButtonBKG('white');
      setButtonText('#41484D');
    }
  };

  const handleLang = (e: any) => {
    setLang(e.value);
    console.log(lang);
  };

  const handleForm = (e: any) => {
    setForm(e.value);
    console.log(form);
  };

  const handleSort = (e: any) => {
    setSort(e.value);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <BottomNavBar />
          <View style={styles.searchRow}>
            {/* SEARCH BAR */}
            <Searchbar
              placeholder="Abreva cream 2%"
              style={styles.search}
              inputStyle={{ color: '#41484D' }}
              iconColor="#41484D"
              value={search}
              onChangeText={setSearch}
            />
            {/* LANGUAGE DROPDOWN */}
            <Dropdown
              placeholder="EN"
              value={lang}
              labelField="label"
              valueField="value"
              data={langOptions}
              onChange={handleLang}
              style={styles.langDropdown}
              dropdownPosition="bottom"
              placeholderStyle={{ color: '#41484D' }}
              itemTextStyle={{ color: '#41484D' }}
            />
          </View>

          <View style={styles.formRow}>
            {/* FORM DROPDOWN */}
            <Dropdown
              placeholder="Form"
              value="tube"
              data={formOptions}
              labelField="label"
              valueField="value"
              onChange={handleForm}
              style={styles.formDropdown}
              dropdownPosition="bottom"
              placeholderStyle={{ color: '#41484D' }}
              itemTextStyle={{ color: '#41484D' }}
            />
            {/* QUANTITY TEXT FIELD */}
            <TextInput
              placeholder="How much?"
              label="How much?"
              mode="outlined"
              style={styles.textInput}
              outlineStyle={{ borderColor: '#41484D', borderWidth: 1 }}
              textColor="#71787E"
            />
          </View>

          <View style={styles.locationRow}>
            {/* LOCATION TEXT FIELD */}
            <TextInput
              placeholder="Where?"
              label="Where?"
              mode="outlined"
              style={styles.textInput}
              outlineStyle={{ borderColor: '#41484D', borderWidth: 1 }}
              textColor="#71787E"
              left={<TextInput.Icon icon="pin" color="#41484D" />}
            />
            {/* RADIUS TEXT FIELD */}
            <TextInput
              placeholder="Radius"
              label="Radius"
              mode="outlined"
              style={styles.textInput}
              outlineStyle={{ borderColor: '#41484D', borderWidth: 1 }}
              textColor="#71787E"
              right={<TextInput.Affix text="miles" textStyle={{ color: '#41484D' }} />}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* PRICE DROPDOWN */}
            <Dropdown
              placeholder="By price"
              value={sort}
              data={sortOptions}
              labelField="label"
              valueField="value"
              onChange={handleSort}
              style={{
                width: 110,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: '#C1C7CE',
                height: 36,
              }}
              placeholderStyle={{ color: '#41484D' }}
              itemTextStyle={{ color: '#41484D' }}
            />
            <Button
              mode="outlined"
              style={styles.genericButton}
              labelStyle={{
                color: buttonText,
                fontSize: 14,
              }}
              contentStyle={{ height: 36 }}
              onPress={handleButton}
              buttonColor={buttonBKG}
            >
              Include generic (docosanal)
            </Button>
          </View>
          {/* example pharmacy cards from figma, implement search results here */}
          <View style={{ width: '100%', marginTop: 12 }}>
            <PharmacyRow
              name="Walgreens"
              price="$35.93"
              distance="0.3mi"
              onPress={() => console.log('Walgreens pressed')}
              onCouponPress={() => console.log('Coupon for Walgreens')}
            />
            <PharmacyRow
              name="Walgreens Specialty Pharmacy"
              price="$35.93"
              distance="0.3mi"
              onPress={() => console.log('Specialty pressed')}
              onCouponPress={() => console.log('Coupon for Specialty')}
            />
            <PharmacyRow
              name="Costco"
              price="$36.85"
              distance="1.2mi"
              onPress={() => console.log('Costco pressed')}
              onCouponPress={() => console.log('Coupon for Costco')}
            />
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
};

export default SelectedScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 32,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  search: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#E5E8ED',
    borderRadius: 8,
    height: 40,
  },
  langDropdown: {
    width: 60,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    padding: 5,
    paddingLeft: 10,
    borderRadius: 10,
    height: 40,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
    gap: 16,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
    gap: 16,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
    gap: 16,
  },
  formDropdown: {
    flex: 1,
    borderColor: '#41484D',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 56,
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'white',
    height: 56,
  },
  genericButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#C1C7CE',
    height: 36,
    maxWidth: 200,
  },
});

// clearIcon for search
