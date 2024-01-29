import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import { useNavigate } from "react-router-dom";

import { useState } from "react";
import React, { useEffect } from 'react';

import './Login.css';
import { decodeToken } from "react-jwt";
import { enableLogin} from '../Utils.js'

const backendURL = process.env.REACT_APP_BACKEND_SERVICE_URL;
const clientValidation = process.env.REACT_APP_CLIENT_VALIDATION;


function Login() {
    const [user, setUser] = useState("");
    const [pwd, setPwd] = useState("");
    const [loginFailed, setLoginFailed] = useState(false);
    const [loginMessage, setLoginMessage] = useState("");    

    const navigate = useNavigate();

    function validateForm() {
        return user.length > 0 && pwd.length > 0;
    }

    function validateLogin() {
        const p = new Promise(function (resolve, reject) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: user, password: pwd })
            };
            fetch(backendURL + '/login', requestOptions)
                .then((result) => result.json()
                    .then((data) => {
                        resolve({ status: result.status, data: data });
                    }))
        });

        return p;

    }

    function login(event) {
        event.preventDefault();
        setLoginFailed(false);

        validateLogin()
            .then(
                (result) => {
                    if (result.status === 403) {
                        setLoginFailed(true);
                        setLoginMessage(result.data);
                    }
                    else if (result.status === 401) {
                        setLoginFailed(true);
                        setLoginMessage(result.data);
                    }
                    else if (result.status === 500) {
                        setLoginFailed(true);
                        setLoginMessage(result.data.error);
                    }
                    else {
                        const tkn = decodeToken(result.data.accessToken);
                        result.data.franchise = tkn.franchise;
                        navigate("/home", { state: result.data });
                    }

                },
                (error) => {
                    console.log(error);
                }
            );
    }

    function checkAuthentication() {

        //console.log(`Checking client validation ${clientValidation}`);
        if (clientValidation === 'JWT') {
            //console.log(` - Validation enabled`);
        } else if (clientValidation === 'Snowflake') {
            console.log(`Checking client validation ${clientValidation} - Checking authorize endpoint of API`);
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Sf-Context-Current-User': 'user1' }
            };
            fetch(backendURL + '/authorize', requestOptions)
                .then((result) => {
                    if (result.ok) {
                        result.json()
                            .then((data) => {
                                const token = decodeToken(data.accessToken);
                                data.franchise = token.franchise;
                                navigate("/", { state: data });
                            });
                    } else {
                        console.warn('Current user is not authorized to use the application');
                    }

                });
        } else {
            console.warn(`Checking client validation ${clientValidation} - Validation disabled - hard coding franchise "1"`);
            const data = { franchise: 1 };
            navigate("/", { state: data });

        }
        return false;

    };

    // eslint-disable-next-line
    useEffect(() => {
        checkAuthentication();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (

        <Container className='loginContainer'>
            
            { enableLogin() &&                    
            <Form className='loginForm' onSubmit={login}>
                <div className="loginFormContent">
                    <div className='loginHeader'>
                        <Image src='bug-sno-R-blue.png' className='loginLogo' />
                        <h3 className="loginTitle"> Tasty App</h3>
                    </div>
                    {/* User */}
                    <FloatingLabel controlId="user" label="User" className="mb-3">
                        <Form.Control type="input" placeholder="user" value={user} onChange={(e) => setUser(e.target.value)} />
                    </FloatingLabel>

                    {/* Password */}
                    <FloatingLabel controlId="pwd" label="Password" className="mb-3">
                        <Form.Control type="password" placeholder="Password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
                    </FloatingLabel>

                    <div className='loginHeader'>
                        {loginFailed ? <p className='message'> {loginMessage} </p> : <p className='message'></p>}

                        {/* Submit button */}
                        <Button type="submit" disabled={!validateForm()}>
                            Login
                        </Button>
                    </div>

                </div>
            </Form>
            }
        </Container>
    );
}

export default Login;