# A simple python script that moves a servo motor to a specific angle
from time import sleep
import lgpio
import sys

def setServoAngle(servo, angle):
    h = lgpio.gpiochip_open(0)  # Open the GPIO chip
    lgpio.gpio_claim_output(h, servo)  # Claim the GPIO pin for output
    dutyCycle = angle / 18. + 3.
    pulseWidth = dutyCycle / 1000.0  # Convert duty cycle to pulse width in seconds
    lgpio.tx_pwm(h, servo, 50, pulseWidth)  # Set PWM with 50Hz frequency and calculated pulse width
    sleep(0.4)
    lgpio.tx_pwm(h, servo, 50, 0)  # Stop PWM
    lgpio.gpiochip_close(h)  # Close the GPIO chip

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: sudo python3 chicky.py <servo_pin> <angle>")
        sys.exit(1)

    try:
        servo = int(sys.argv[1])
        angle = int(sys.argv[2])
        if not (0 <= angle <= 180):
            raise ValueError("Angle must be between 0 and 180 degrees")
    except ValueError as e:
        print(f"Invalid input: {e}")
        sys.exit(1)

    setServoAngle(servo, angle)