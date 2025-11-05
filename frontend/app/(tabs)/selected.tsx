import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Button,
  Divider,
  Searchbar,
  TextInput,
  Provider as PaperProvider,
} from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectedScreen = () => {
  const time = '9:30';
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
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}
          >
            {/* SEARCH BAR */}
            <Searchbar
              placeholder=""
              style={styles.search}
              inputStyle={{ color: '#41484D' }}
              iconColor="#41484D"
              value={search}
              onChangeText={setSearch}
            />
            {/* LANGUAGE DROPDOWN */}
            <Dropdown
              placeholder="EN"
              labelField="label"
              valueField="value"
              data={langOptions}
              onChange={handleLang}
              style={{
                width: 60,
                borderColor: '#C1C7CE',
                borderWidth: 1,
                padding: 5,
                paddingLeft: 10,
                borderRadius: 10,
              }}
              dropdownPosition="bottom"
              placeholderStyle={{ color: '#41484D' }}
              itemTextStyle={{ color: '#41484D' }}
            />
          </View>

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}
          >
            {/* FORM DROPDOWN */}
            {/* use render label option */}
            <Dropdown
              placeholder="Form"
              value="Tube"
              data={formOptions}
              labelField="form"
              valueField="value"
              onChange={handleForm}
              style={{
                borderColor: '#41484D',
                borderWidth: 1,
                margin: 5,
                padding: 5,
                paddingLeft: 10,
                borderRadius: 5,
                height: 50,
                width: 150,
              }}
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

          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
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
              style={[styles.textInput, { marginRight: 20 }]}
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
              value="Tube"
              data={sortOptions}
              labelField="label"
              valueField="value"
              onChange={handleSort}
              style={{
                width: 100,
                padding: 5,
                paddingLeft: 10,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#C1C7CE',
                height: 36,
              }}
              placeholderStyle={{ color: '#41484D' }}
              itemTextStyle={{ color: '#41484D' }}
            />
            <Button
              mode="contained"
              style={{
                margin: 5,
                padding: 0,
                width: 160,
                alignSelf: 'flex-end',
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#C1C7CE',
                height: 36,
              }}
              labelStyle={{
                alignSelf: 'center',
                margin: 8,
              }}
              contentStyle={{ padding: 0, margin: 0 }}
              onPress={handleButton}
              buttonColor={buttonBKG}
            >
              Include generic (docosanal)
            </Button>
          </View>

          <View style={{ backgroundColor: '#F6FAFE', marginTop: 12, padding: 10, width: '100%' }}>
            <View style={{ flexDirection: 'row' }}>
              {/* ICON */}
              <Text style={{ alignSelf: 'center' }}></Text>
              <View style={{ flexDirection: 'column', flex: 2 }}>
                <Text>Pharmacy Name</Text>
                <Text>$2.00</Text>
              </View>
              <Text style={{ alignSelf: 'center' }}>0.6mi</Text>
              {/* ICON */}
              <Text style={{ alignSelf: 'center' }}></Text>
            </View>
            <Divider style={{ marginTop: 8 }} />
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
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  textInput: {
    margin: 5,
    backgroundColor: 'white',
    width: 150,
    height: 50,
  },
  search: {
    margin: 10,
    width: '70%',
    alignSelf: 'flex-start',
    backgroundColor: '#E5E8ED',
  },
  drop: {
    alignSelf: 'center',
    backgroundColor: '#B6EBFF',
  },
});

// clearIcon for search
