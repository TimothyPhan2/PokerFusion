import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ForgotPassword() {
  return (
    <SafeAreaView style= {{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <View>

      <Text>forgot_password</Text>
        </View>
    </SafeAreaView>
  )
}