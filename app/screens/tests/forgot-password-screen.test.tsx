import React from "react"
import { fireEvent, waitFor } from '@testing-library/react-native'
import { renderWithNativeBase } from './utils/jest-setup'
import { ForgotPasswordScreen } from '../index'
import { Accounts } from '@meteorrn/core'

jest.mock('@react-navigation/native', () => {
    return {
        createNavigatorFactory: jest.fn(),
        useNavigation: jest.fn(),
        createNavigationContainerRef: jest.fn(),
    }
});

jest.mock('react-native-vector-icons', () => 'Icon');

describe('<ForgotPasswordScreen />', () => {

    it('renders correctly', () => {
        const tree = renderWithNativeBase(<ForgotPasswordScreen navigation={undefined} route={undefined} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('forgot password method gets called', async () => {
        const spyMethod = jest.spyOn(Accounts, 'forgotPassword');
        const { getByLabelText } = renderWithNativeBase(<ForgotPasswordScreen navigation={undefined} route={undefined} />);

        const emailInput = getByLabelText(/Email/i);
        const sendButton = getByLabelText(/Send/i);

        fireEvent.changeText(emailInput, 'not_exist@test.com');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(sendButton).toBeDisabled();
            expect(spyMethod).toHaveBeenCalled();
        });

        jest.clearAllMocks();
    });
});