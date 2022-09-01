'use strict';

export const buildCAClient = (FabricCAServices: any, ccp: any, caHostName: any) => {
    // 创建一个新的CA客户端来与CA交互
    const caInfo = ccp.certificateAuthorities[caHostName];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return caClient;
};

export const enrollAdmin = async (caClient: any, wallet: any, orgMspId: any, adminUserId: any, adminUserPasswd: any) => {
    try {
        // 检查是否已注册管理员用户
        const identity = await wallet.get(adminUserId);
        if (identity) {
            console.log('An identity for the admin user already exists in the wallet');
            return;
        }

        // 注册管理员用户，并将新身份导入到钱包。
        const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPasswd });
        // 生成X.509证书
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(adminUserId, x509Identity);
        console.log('Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user : ${error}`);
    }
};

// export const registerAndEnrollUser = async (caClient: any, wallet: any, orgMspId: any, userId: any, affiliation: any, adminUserId: any) => {
//     try {
//         //  检查该用户是否已注册
//         const userIdentity = await wallet.get(userId);
//         if (userIdentity) {
//             console.log(`An identity for the user ${userId} already exists in the wallet`);
//             return;
//         }
//         // 使用管理员身份注册用户账号
//         const adminIdentity = await wallet.get(adminUserId);
//         if (!adminIdentity) {
//             console.log('An identity for the admin user does not exist in the wallet');
//             return;
//         }
//         // 构建用于通过CA进行身份验证的对象
//         const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
//         const adminUser = await provider.getUserContext(adminIdentity, adminUserId);
//         // 注册用户并将新身份导入到钱包
//         const secret = await caClient.register({
//             affiliation: affiliation,
//             enrollmentID: userId,
//             role: 'client'
//         }, adminUser);
//         const enrollment = await caClient.enroll({
//             enrollmentID: userId,
//             enrollmentSecret: secret
//         });
//         const x509Identity = {
//             credentials: {
//                 certificate: enrollment.certificate,
//                 privateKey: enrollment.key.toBytes(),
//             },
//             mspId: orgMspId,
//             type: 'X.509',
//         };
//         await wallet.put(userId, x509Identity);
//         console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
//     } catch (error) {
//         console.error(`Failed to register user : ${error}`);
//     }


export const registerAndEnrollUser = async (caClient, wallet, orgMspId, userId, affiliation, adminUserId) => {
    try {
        // 1、使用userId检查该用户是否已注册
        // 2、根据adminUserId获取管理员身份adminIdentity并验证是否存在
        const adminIdentity = await wallet.get(adminUserId);
        // 3、获取管理员身份信息
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);
        // 4、使用管理员身份注册、登记用户
        const secret = await caClient.register({
            affiliation: affiliation,
            enrollmentID: userId,
            role: 'client'
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });
        // 5、生成x509证书
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        // 6、将用户身份导入到钱包
        await wallet.put(userId, x509Identity);
    } catch (error) {
    }
};