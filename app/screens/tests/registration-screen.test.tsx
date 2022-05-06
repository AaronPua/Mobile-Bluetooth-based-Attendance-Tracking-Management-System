import React from "react"
import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderWithNativeBase } from './utils/jest-setup'
import { RegistrationScreen } from '../index'
import Meteor from '@meteorrn/core'

jest.mock('@react-navigation/native', () => {
    return {
        createNavigatorFactory: jest.fn(),
        useNavigation: jest.fn(),
        createNavigationContainerRef: jest.fn(),
    }
});

jest.mock('react-native-vector-icons', () => 'Icon');

describe('<RegistrationScreen />', () => {

    it('renders correctly', () => {
        const tree = renderWithNativeBase(<RegistrationScreen navigation={undefined} route={undefined} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('registration method gets called', async () => {
        const spyMethod = jest.spyOn(Meteor, 'call');
        const { getByLabelText } = renderWithNativeBase(<RegistrationScreen navigation={undefined} route={undefined} />);

        const firstName = getByLabelText(/First Name/i);
        const lastName = getByLabelText(/Last Name/i);
        const emailInput = getByLabelText(/Email/i);
        const passwordInput = getByLabelText(/Password/i);
        const registerButton = getByLabelText(/Register/i);

        fireEvent.changeText(firstName, 'Test User');
        fireEvent.changeText(lastName, 'Fake');
        fireEvent.changeText(emailInput, 'not_exist@test.com');
        fireEvent.changeText(passwordInput, 'test');
        fireEvent.press(registerButton);

        await waitFor(() => {
            expect(spyMethod).toHaveBeenCalled();
        });
    });
});