import { Button, View, Text, Picker, StyleSheet, TouchableOpacity} from 'react-native';
import React, {Component} from "react";
import db from "./Database.js";

export default class SelectLang extends Component {
    constructor(props){
      super(props);
      this.state = {
        lang: "en"
      }
    }


    storeLanguage(lang) {
      db.database().ref('users/' + this.props.navigation.getParam('uid', "NONE")).set({
        language: lang
      });
      this.props.navigation.navigate("Loading");
    }


    render() {
      return(
        <View style={styles.view}>
          <View style={styles.in}>
            <Text style={styles.input}> Please Select Your Language </Text>
          </View>
          <Picker selectedValue={this.state.lang} onValueChange={(value) => this.setState({lang: value})}>
            <Picker.Item label = "English" value = "en" />
            <Picker.Item label = "Español" value = "es" />
            <Picker.Item label = "French" value = "fr" />
            <Picker.Item label = "日本語" value = "ja" />
            <Picker.Item label = "Русский" value = "ru" />
            <Picker.Item label = "Deutsch" value = "de" />
            <Picker.Item label = "Chinese (PRC)" value = "zh-CN" />
            <Picker.Item label = "ไทย" value = "th" />

          </Picker>
          <View style={styles.in}>
            <TouchableOpacity style={styles.blueStyle} onPress={() => this.storeLanguage(this.state.lang)}>
              <Text style={styles.select}> Done</Text>
            </TouchableOpacity>
          </View>
        </View>

      )
    };
}


const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#fff",
     justifyContent: "center",
  },
  in: {
    alignItems: "center"
  },
  picker: {
     marginTop: 250,
  },
  input: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  done: {
    textAlign: 'center',
    justifyContent: "center",
    marginTop: 20
  },
  blueStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 25,
    width: 200,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#4267b2',
    justifyContent: 'center',
  },
  select: {
    color: "white"
  }

});
