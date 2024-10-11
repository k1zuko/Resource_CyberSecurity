import jwt
import datetime
class JWT:
    jwt_symmetric_security_key = "8697800004ee25fc33436978ab6e2ed6ee1a97da699a53a53d96cc4d08519e185d14727ca18728bf1efcde454eea6f65b8d466a4fb6550d5c795d9d9176ea6cf021ef9fa21ffc25ac40ed80f4a4473fc1ed10e69eaf957cfc4c67057e547fadfca95697242a2ffb21461e7f554caa4ab7db07d2d897e7dfbe2c0abbaf27f215c0ac51742c7fd58c3cbb89e55ebb4d96c8ab4234f2328e43e095c0f55f79704c49f07d5890236fe6b4fb50dcd770e0936a183d36e4d544dd4e9a40f5ccf6d471bc7f2e53376893ee7c699f48ef392b382839a845394b6b93a5179d33db24a2963f4ab0722c9bb15d361a34350a002de648f13ad8620750495bff687aa6e2f298429d6c12371be19b0daa77d40214cd6598f595712a952c20eddaae76a28d89fb15fa7c677d336e44e9642634f32a0127a5bee80838f435f163ee9b61a67e9fb2f178a0c7c96f160687e7626497115777b80b7b8133cef9a661892c1682ea2f67dd8f8993c87c8c9c32e093d2ade80464097e6e2d8cf1ff32bdbcd3dfd24ec4134fef2c544c75d5830285f55a34a525c7fad4b4fe8d2f11af289a1003a7034070c487a18602421988b74cc40eed4ee3d4c1bb747ae922c0b49fa770ff510726a4ea3ed5f8bf0b8f5e1684fb1bccb6494ea6cc2d73267f6517d2090af74ceded8c1cd32f3617f0da00bf1959d248e48912b26c3f574a1912ef1fcc2e77a28b53d0a"
    super_admin_email_claim_value = "superadmin@blazorized.htb"
    posts_permissions_claim_value = "Posts_Get_All"
    categories_permissions_claim_value = "Categories_Get_All"
    super_admin_role_claim_value = "Super_Admin"
    issuer = "http://api.blazorized.htb"
    api_audience = "http://api.blazorized.htb"
    admin_dashboard_audience = "http://admin.blazorized.htb"
    @staticmethod
    def get_signing_credentials():
        return JWT.jwt_symmetric_security_key
    @staticmethod
    def generate_temporary_jwt(expiration_duration_in_seconds=60):
        claims = {
            "email": JWT.super_admin_email_claim_value,
            "roles": [JWT.posts_permissions_claim_value, JWT.categories_permissions_claim_value],
            "iss": JWT.issuer,
            "aud": JWT.api_audience,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expiration_duration_in_seconds)
        }
        token = jwt.encode(
            claims,
            JWT.get_signing_credentials(),
            algorithm="HS512"
        )
        return token
    @staticmethod
    def generate_super_admin_jwt(expiration_duration_in_seconds=60):
        claims = {
            "email": JWT.super_admin_email_claim_value,
            "roles": [JWT.super_admin_role_claim_value],
            "iss": JWT.issuer,
            "aud": JWT.admin_dashboard_audience,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=expiration_duration_in_seconds)
        }
        token = jwt.encode(
            claims,
            JWT.get_signing_credentials(),
            algorithm="HS512"
        )
        return token
    @staticmethod
    def verify_jwt(token):
        try:
            jwt.decode(
                token,
                JWT.jwt_symmetric_security_key,
                algorithms=["HS512"],
                issuer=JWT.issuer,
                audience=[JWT.api_audience, JWT.admin_dashboard_audience]
            )
            return True
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return False
        except jwt.InvalidTokenError:
            print("Invalid token")
            return False
# Main Program
if __name__ == "__main__":
    # Generate a temporary JWT token
    temporary_token = JWT.generate_temporary_jwt()
    print("Temporary JWT Token:")
    print(temporary_token)
    # Generate a super admin JWT token
    super_admin_token = JWT.generate_super_admin_jwt()
    print("\nSuper Admin JWT Token:")
    print(super_admin_token)
    # Optionally, verify a JWT token
    is_valid = JWT.verify_jwt(temporary_token)
    print(f"\nVerification result for Temporary JWT Token: {is_valid}")
    is_valid = JWT.verify_jwt(super_admin_token)
    print(f"Verification result for Super Admin JWT Token: {is_valid}")
