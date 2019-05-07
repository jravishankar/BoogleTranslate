import { Button, View, Text, Picker, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default class Main extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        select: this.props.select
      }
    }


    render() {
      return(
        <View style={styles.inout}>
          <Text style={styles.input}> Input Language </Text>
            <Picker style={styles.picker} selectedValue={inlang} onValueChange={(lang) => {this.setState({inlang:lang})}}>
              <Picker.Item label = "English" value = "en" />
              <Picker.Item label = "Español  (Spanish)" value = "es" />
              <Picker.Item label = "日本語    (Japanese)" value = "ja" />
              <Picker.Item label = "Русский  (Russian)" value = "ru" />
              <Picker.Item label = "Deutsch (German)" value = "de" />
            </Picker>
        </View>
      )
    };
}


const styles = StyleSheet.create({
  input: {
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 35,
  },

  picker: {
    marginTop: -20,
  },
});
