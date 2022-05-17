import React from "react"
import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderWithNativeBase } from './utils/jest-setup'
import { LoginScreen } from '../index'
import Meteor from '@meteorrn/core'

jest.mock('@react-navigation/native', () => {
    return {
        createNavigatorFactory: jest.fn(),
        useNavigation: jest.fn(),
        createNavigationContainerRef: jest.fn(),
    }
});

jest.mock('react-native-vector-icons', () => 'Icon');

// jest.mock('@react-navigation/stack', () => ({
//     createStackNavigator: jest.fn(),
// }));

describe('<LoginScreen />', () => {

    it('renders correctly', () => {
        const tree = renderWithNativeBase(<LoginScreen navigation={undefined} route={undefined} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('login method gets called', async () => {
        const spyLogin = jest.spyOn(Meteor, 'loginWithPassword');
        const { getByLabelText } = renderWithNativeBase(<LoginScreen navigation={undefined} route={undefined} />);

        const emailInput = getByLabelText(/Email/i);
        const passwordInput = getByLabelText(/Password/i);
        const loginButton = getByLabelText(/Sign In/i);

        fireEvent.changeText(emailInput, 'not_exist@test.com');
        fireEvent.changeText(passwordInput, 'test');
        fireEvent.press(loginButton);

        await waitFor(() => {
            expect(loginButton).toBeDisabled();
            expect(spyLogin).toHaveBeenCalled();
        });

        jest.clearAllMocks();
    });
});