// Created by Neitri, edited by jojos38 free of charge, free to redistribute

Shader "jojos38/NeitriWatch" {
	Properties {
		_MainTex ("_MainTex", 2D) = "white" {}
		_Color("_Color", Color) = (1,1,1,1)
		[FloatRange]_Brightness("_Brightness", Range(0, 1)) = 1
		[HideInInspector]_RealTimeHours("Real Time Hours", Float) = 1
		[HideInInspector]_RealTimeMinutes("Real Time Minutes", Float) = 1
	}
	SubShader {
		Tags {
			"Queue" = "Transparent"
			"RenderType" = "Transparent"
		}
		LOD 100
		Cull Off
		Blend SrcAlpha OneMinusSrcAlpha // transparent

		Pass {
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			#pragma multi_compile_fog // make fog work
			
			#include "UnityCG.cginc"

			struct appdata {
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
				float4 color : COLOR;
			};

			struct v2f {
				float4 vertex : SV_POSITION;
				float3 uv : TEXCOORD0;
				float4 color : COLOR;
				UNITY_FOG_COORDS(1)
			};

			uniform float _RealTimeHours;
			uniform float _RealTimeMinutes;
			sampler2D _MainTex;
			float4 _MainTex_ST;
			float4 _Color;
			float _Brightness;

			v2f vert (appdata v) {
				v2f o;
				o.uv.xy = TRANSFORM_TEX(v.uv, _MainTex);
				o.uv.z = 0;
				o.color = _Color * _Brightness;

				uint s1 = floor(_Time.y);
				uint s10 = floor(s1 / 10);
				uint m1 = floor(s10 / 6);
				uint m10 = floor(m1 / 10);
				uint h1 = floor(m10 / 6);
				uint h10 = floor(h1 / 10);

				uint minutes60 = int(_RealTimeMinutes / 0.0078125f);
				uint minutesL = int(minutes60 % 10);
				uint minutesR = int(minutes60 / 10);

				uint hours60 = int(_RealTimeHours / 0.0078125f);
				uint hoursL = int(hours60 % 10);
				uint hoursR = int(hours60 / 10);

				s1 -= s10 * 10;
				s10 -= m1 * 6;
				m1 -= m10 * 10;
				m10 -= h1 * 6;
				h1 -= h10 * 10;

				if (v.color.r == 0) {
					if (v.color.g == 0) {
						if (v.color.b == 0) {
							// seconds
							o.uv.x += s1 / 10.0f;
						} else {
							// 10 seconds
							o.uv.x += s10 / 10.0f;
						}
					} else {
						if (v.color.b == 0) {
							// minutes
							// o.uv.x += m1 / 10.0f;
							o.uv.x += minutesL / 10.0f;
						} else {
							// 10 minutes
							// o.uv.x += m10 / 10.0f;
							o.uv.x += minutesR / 10.0f;
						}
					}
				} else if (v.color.r == 1) {
					if (v.color.g == 0) {
						if (v.color.b == 0) {
							// hours
							// o.uv.x += h1 / 10.0f;
							o.uv.x += hoursL / 10.0f;
						} else {
							// 10 hours
							// o.uv.x += h10 / 10.0f;
							o.uv.x += hoursR / 10.0f;
						}
					} else {
						uint fps1 = unity_DeltaTime.w;
						uint fps10 = floor(fps1 / 10);
						fps1 -= fps10 * 10;
						if (v.color.b == 0) {
							// fps
							o.uv.x += fps1 / 10.0f;
						} else {
							// 10 fps
							o.uv.x += fps10 / 10.0f;
						}
					}
				}
				o.vertex = UnityObjectToClipPos(v.vertex);
				UNITY_TRANSFER_FOG(o,o.vertex);
				return o;
			}
			

			fixed4 frag (v2f i) : SV_Target
			{
				// Number quad
				fixed4 color = tex2D(_MainTex, i.uv);
				clip(color.a - 0.1);
				color *= i.color;

				// Apply fog
				UNITY_APPLY_FOG(i.fogCoord, color);
				return color;
			}
			ENDCG
		}
	}
}
